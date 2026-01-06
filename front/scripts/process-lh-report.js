const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../../docs');

// Helper to format date for folder name
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
};

async function main() {
    // 1. Find the generated report files in docs root
    if (!fs.existsSync(DOCS_DIR)) {
        console.error('Docs directory not found.');
        return;
    }

    const files = fs.readdirSync(DOCS_DIR);
    const reportFiles = files.filter(f => f.endsWith('.json') || f.endsWith('.html'));

    if (reportFiles.length === 0) {
        console.log('No report files found processing.');
        return;
    }

    // 2. Create a specific folder for this run
    const timestamp = getTimestamp();
    const targetDir = path.join(DOCS_DIR, `report-${timestamp}`);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    let jsonReportPath = null;

    // 3. Move files to the new folder
    reportFiles.forEach(file => {
        const oldPath = path.join(DOCS_DIR, file);
        const newPath = path.join(targetDir, file);
        fs.renameSync(oldPath, newPath);

        if (file.endsWith('.json') && file !== 'manifest.json') {
            jsonReportPath = newPath;
        }
    });

    // 4. Generate Markdown Summary
    if (jsonReportPath) {
        try {
            let markdown = `# ⚡️ Lighthouse Performance Report\n\n`;

            // Process ALL json reports found in the target directory
            const jsonFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');

            jsonFiles.forEach(jsonFile => {
                const reportPath = path.join(targetDir, jsonFile);
                const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

                if (!report.categories) {
                    console.log(`Skipping ${jsonFile}: No categories found`);
                    return;
                }

                const url = report.finalUrl;
                const fetchTime = new Date(report.fetchTime).toLocaleString();

                markdown += `## 🌐 URL: ${url}\n`;
                markdown += `**Run Time:** ${fetchTime} | [View HTML Report](./${jsonFile.replace('.json', '.html')})\n\n`;

                // 1. Category Scores
                markdown += `### 📊 Category Scores\n`;
                markdown += `| Category | Score | Status |\n`;
                markdown += `| :--- | :---: | :---: |\n`;

                Object.values(report.categories).forEach(cat => {
                    const score = Math.round(cat.score * 100);
                    const icon = score >= 90 ? '🟢' : (score >= 50 ? '🟠' : '🔴');
                    markdown += `| **${cat.title}** | ${score} | ${icon} |\n`;
                });
                markdown += `\n`;

                // 2. Core Web Vitals & Metrics
                markdown += `### ⏱️ Core Web Vitals & Metrics\n`;
                markdown += `| Metric | Time / Score | Evaluation |\n`;
                markdown += `| :--- | :---: | :---: |\n`;

                const metrics = [
                    { id: 'first-contentful-paint', label: 'First Contentful Paint (FCP)' },
                    { id: 'largest-contentful-paint', label: 'Largest Contentful Paint (LCP)' },
                    { id: 'total-blocking-time', label: 'Total Blocking Time (TBT)' },
                    { id: 'cumulative-layout-shift', label: 'Cumulative Layout Shift (CLS)' },
                    { id: 'speed-index', label: 'Speed Index' },
                ];

                metrics.forEach(m => {
                    const audit = report.audits[m.id];
                    if (audit) {
                        const displayValue = audit.displayValue;
                        const score = audit.score;
                        // Score: 0-0.49 (Poor/Red), 0.5-0.89 (Needs Improvement/Orange), 0.9-1 (Good/Green)
                        // Note: Lighthouse audit scores are normalized 0-1.
                        let icon = '⚪';
                        if (score !== null) {
                            icon = score >= 0.9 ? '🟢' : (score >= 0.5 ? '🟠' : '🔴');
                        }
                        markdown += `| ${m.label} | **${displayValue}** | ${icon} |\n`;
                    }
                });
                markdown += `\n---\n\n`;
            });

            const mdPath = path.join(targetDir, 'SUMMARY.md');
            fs.writeFileSync(mdPath, markdown, 'utf8');
            console.log(`✅ Detailed Markdown summary generated at: ${mdPath}`);

        } catch (e) {
            console.error('Error generating markdown summary:', e);
        }
    }
}

main();
