import { marked } from "marked";
import xss from "xss";
import TurndownService from "turndown";

function sanitizeMarkdownContent(markdownContent) {
    const turndownService = new TurndownService();

    // Replace literal '\n' string representations to actual newline characters
    const processedContent = (markdownContent || '').replace(/\\n/g, '\n');

    // 1. Convert markdown to html
    const convertedHtml = marked.parse(processedContent);

    // 2. Sanitize html using xss (fully ESM/CJS compatible, avoids htmlparser2 runtime errors)
    const sanitizedHtml = xss(convertedHtml, {
        whiteList: {
            ...xss.whiteList,
            img: ['src', 'alt', 'title', 'width', 'height'],
        }
    });

    // 3. Convert the sanitized html back to markdown
    const sanitizedMarkdown = turndownService.turndown(sanitizedHtml);

    return sanitizedMarkdown;
}

export default sanitizeMarkdownContent;