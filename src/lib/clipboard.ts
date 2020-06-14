/**
 * Copied given text into clipboard
 */
export default function copyToClipboard(data: string) {
    const textarea = document.createElement('textarea');

    textarea.setAttribute('style', 'width:1px;border:0;opacity:0;');
    document.body.appendChild(textarea);
    textarea.value = data;
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
