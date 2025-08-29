// 34js/apps/changelogPage.js

import { getChangelogData, appNameToModuleFile } from '../changelog.js'; // <-- ИЗМЕНЕННЫЙ ПУТЬ

export function getHtml() {
    let listHtml = getChangelogData().map(entry => {
        const capitalizedDescs = entry.descriptions.map(desc => desc.charAt(0).toUpperCase() + desc.slice(1));
        
        const descriptionsHtml = `<ul class=\"list-disc list-inside mt-1\">${capitalizedDescs.map(d => `<li class=\"ml-4\">${d}</li>`).join('')}</ul>`;
        
        const moduleFile = appNameToModuleFile[entry.appName];
        const appHref = moduleFile ? `?app=${moduleFile}` : '#';
        
        const appNameHtml = entry.appName === 'Общее' 
            ? `<span class=\"font-bold text-gray-800 dark:text-gray-300\">${entry.appName}.</span>`
            : `<a href=\"${appHref}\" data-app-name=\"${entry.appName}\" class=\"changelog-link font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300\">${entry.appName}.</a>`;

        return `
            <div class=\"border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 first:mt-0 first:pt-0 first:border-0\">
                <p class=\"font-semibold text-gray-500 dark:text-gray-400\">${entry.date}</p>
                <div class=\"mt-2 text-gray-800 dark:text-gray-300\">
                    ${appNameHtml}
                    ${descriptionsHtml}
                </div>
            </div>
        `;
    }).join('');
    
    return `<div class=\"p-4\">${listHtml}</div>`;
}

export function init() {
    // No specific initialization needed for this static page
}

export function cleanup() {}
