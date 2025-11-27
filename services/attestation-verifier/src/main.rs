use std::convert::Infallible;
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use warp::{http::StatusCode, Filter, Rejection, Reply};
use sha2::{Digest, Sha256};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AttestationPayload {
    platform: Platform,
    integrity_token: String,
    device_key: String,
    nonce: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum Platform {
    Ios,
    Android,
    Web,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionResponse {
    token: String,
    trust_score: f32,
    nullifier: String,
}

#[derive(Debug)]
struct BadRequest(&'static str);

impl warp::reject::Reject for BadRequest {}

#[tokio::main]
async fn main() {
    let verify_route = warp::path("verify")
        .and(warp::post())
        .and(warp::header::optional("x-mock-attestation"))
        .and(warp::body::json())
        .and_then(handle_verify)
        .recover(handle_rejection);

    println!("Attestation verifier listening on 0.0.0.0:3000");
    warp::serve(verify_route).run(([0, 0, 0, 0], 3000)).await;
}

async fn handle_verify(
    mock_header: Option<String>,
    payload: AttestationPayload,
) -> Result<impl Reply, Rejection> {
    validate_payload(&payload).map_err(|e| warp::reject::custom(e))?;

    let mock_mode = is_mock_enabled(&mock_header);
    let trust_score = match payload.platform {
        Platform::Web => verify_web(&payload, mock_mode),
        Platform::Ios => verify_apple(&payload, mock_mode),
        Platform::Android => verify_google(&payload, mock_mode),
    };
    let nullifier = derive_nullifier(&payload.device_key);

    let response = SessionResponse {
        token: format!("session-{}", current_timestamp()),
        trust_score,
        nullifier,
    };

    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        StatusCode::OK,
    ))
}

fn validate_payload(payload: &AttestationPayload) -> Result<(), BadRequest> {
    if payload.integrity_token.trim().is_empty() {
        return Err(BadRequest("integrity_token required"));
    }
    if payload.device_key.trim().is_empty() {
        return Err(BadRequest("device_key required"));
    }
    if payload.nonce.trim().is_empty() {
        return Err(BadRequest("nonce required"));
    }
    match payload.platform {
        Platform::Ios | Platform::Android | Platform::Web => Ok(()),
    }
}

fn is_mock_enabled(mock_header: &Option<String>) -> bool {
    if let Ok(flag) = env::var("E2E_MODE") {
        if flag == "true" {
            return true;
        }
    }
    mock_header
        .as_ref()
        .map(|v| v.eq_ignore_ascii_case("true"))
        .unwrap_or(false)
}

fn verify_web(payload: &AttestationPayload, mock_mode: bool) -> f32 {
    if mock_mode || payload.integrity_token.trim() == "test-token" {
        return 1.0;
    }
    if payload.integrity_token.len() > 8 {
        0.8
    } else {
        0.0
    }
}

fn verify_apple(payload: &AttestationPayload, mock_mode: bool) -> f32 {
    if mock_mode {
        return 1.0;
    }
    // Stub: real chain validation will replace this in Sprint 2
    if payload.integrity_token.starts_with("apple-") {
        1.0
    } else {
        0.5
    }
}

fn verify_google(payload: &AttestationPayload, mock_mode: bool) -> f32 {
    if mock_mode {
        return 1.0;
    }
    if payload.integrity_token.starts_with("google-") {
        1.0
    } else {
        0.5
    }
}

async fn handle_rejection(err: Rejection) -> Result<impl Reply, Infallible> {
    if let Some(BadRequest(msg)) = err.find() {
        let body = warp::reply::json(&serde_json::json!({
            "success": false,
            "error": msg
        }));
        return Ok(warp::reply::with_status(body, StatusCode::BAD_REQUEST));
    }

    let body = warp::reply::json(&serde_json::json!({
        "success": false,
        "error": "internal_error"
    }));
    Ok(warp::reply::with_status(body, StatusCode::INTERNAL_SERVER_ERROR))
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0))
        .as_secs()
}

fn derive_nullifier(device_key: &str) -> String {
    // Stable hash of device_key + salt (env override to allow per-env variation)
    let salt = env::var("NULLIFIER_SALT").unwrap_or_else(|_| "vh-nullifier-salt".to_string());
    let mut hasher = Sha256::new();
    hasher.update(salt.as_bytes());
    hasher.update(device_key.as_bytes());
    let hash = hasher.finalize();
    format!("nullifier-{:x}", hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use warp::test::request;

    #[tokio::test]
    async fn verify_accepts_valid_payload() {
        let filter = warp::path("verify")
            .and(warp::post())
            .and(warp::header::optional("x-mock-attestation"))
            .and(warp::body::json())
            .and_then(handle_verify)
            .recover(handle_rejection);

        let body = serde_json::json!({
            "platform": "web",
            "integrityToken": "token",
            "deviceKey": "dev",
            "nonce": "n1"
        });

        let res = request()
            .method("POST")
            .path("/verify")
            .json(&body)
            .reply(&filter)
            .await;

        assert_eq!(res.status(), StatusCode::OK);
        let parsed: SessionResponse = serde_json::from_slice(res.body()).unwrap();
        assert!(parsed.trust_score >= 0.8);
        assert!(parsed.nullifier.starts_with("nullifier-"));
    }

    #[tokio::test]
    async fn verify_honors_mock_header() {
        let filter = warp::path("verify")
            .and(warp::post())
            .and(warp::header::optional("x-mock-attestation"))
            .and(warp::body::json())
            .and_then(handle_verify)
            .recover(handle_rejection);

        let body = serde_json::json!({
            "platform": "android",
            "integrityToken": "whatever",
            "deviceKey": "dev",
            "nonce": "n1"
        });

        let res = request()
            .method("POST")
            .path("/verify")
            .header("x-mock-attestation", "true")
            .json(&body)
            .reply(&filter)
            .await;

        assert_eq!(res.status(), StatusCode::OK);
        let parsed: SessionResponse = serde_json::from_slice(res.body()).unwrap();
        assert!((parsed.trust_score - 1.0).abs() < f32::EPSILON);
    }

    #[tokio::test]
    async fn verify_rejects_missing_fields() {
        let filter = warp::path("verify")
            .and(warp::post())
            .and(warp::header::optional("x-mock-attestation"))
            .and(warp::body::json())
            .and_then(handle_verify)
            .recover(handle_rejection);

        let body = serde_json::json!({
            "platform": "web",
            "integrityToken": "",
            "deviceKey": "",
            "nonce": ""
        });

        let res = request()
            .method("POST")
            .path("/verify")
            .json(&body)
            .reply(&filter)
            .await;

        assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    }

    #[test]
    fn derive_nullifier_is_stable() {
        let n1 = derive_nullifier("device-key-123");
        let n2 = derive_nullifier("device-key-123");
        let n3 = derive_nullifier("device-key-abc");
        assert_eq!(n1, n2);
        assert_ne!(n1, n3);
        assert!(n1.starts_with("nullifier-"));
    }
}
