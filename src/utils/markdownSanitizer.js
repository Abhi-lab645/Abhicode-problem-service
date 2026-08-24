import { marked } from "marked";

import sanitizeHtml from "sanitize-html";

import TurndownService from "turndown";
function sanitizeMarkdownContent(markdownContent){

    const turndownService=new TurndownService();

    // Replace literal '\n' string representations to actual newline characters
    const processedContent = markdownContent.replace(/\\n/g, '\n');

    // 1. Convert markdown to html

    const convertedHtml=marked.parse(processedContent);
    

    // 2. Sanitize html

    const sanitizedHtml=sanitizeHtml(convertedHtml,{

        allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img'])
    });

    // 3. Convert the sanitized html back to markdown

    const  sanitizedMarkdown =turndownService.turndown(sanitizedHtml);


    return sanitizedMarkdown;
}



export default sanitizeMarkdownContent;