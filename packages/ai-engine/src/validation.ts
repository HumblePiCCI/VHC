import type { AnalysisResult } from './schema';

export interface ValidationWarning {
    code: string;
    message: string;
    path?: string[];
}

export function validateAnalysisAgainstSource(
    articleText: string,
    analysis: AnalysisResult
): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const normalizedText = articleText.toLowerCase();

    // 1. Quote Validation
    // TODO: Implement fuzzy matching or robust quote extraction
    // For now, simple inclusion check

    // 2. Date/Year Validation
    const currentYear = new Date().getFullYear();
    const yearsInSummary = analysis.summary.match(/\b(19|20)\d{2}\b/g) || [];

    for (const year of yearsInSummary) {
        if (!normalizedText.includes(year)) {
            warnings.push({
                code: 'HALLUCINATED_YEAR',
                message: `Summary mentions year ${year} which does not appear in source text`,
                path: ['summary']
            });
        }
    }

    return warnings;
}
