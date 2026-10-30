import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

// 2x keeps text crisp when zoomed; JPEG at this quality is ~90x smaller than
// the uncompressed PNG jsPDF would otherwise embed.
const EXPORT_SCALE = 2;
const JPEG_QUALITY = 0.92;

/**
 * Exports a given HTML element to PDF.
 * Uses html2canvas which has broader CSS compatibility than html-to-image.
 *
 * @param elementId The ID of the HTML element to export
 * @param filename  The name of the downloaded PDF file
 */
export const exportToPDF = async (
    elementId: string,
    filename: string = 'timetable.pdf',
) => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
    }

    // Temporarily remove overflow clipping on the target element and ancestors
    // so the full content is captured instead of only the visible viewport.
    const overflowFixups: {
        el: HTMLElement;
        overflow: string;
        overflowX: string;
    }[] = [];
    const colorProperties = [
        'color',
        'backgroundColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor',
        'caretColor',
        'boxShadow',
        'textShadow',
        'fill',
        'stroke',
    ] as const;

    type ColorProperty = (typeof colorProperties)[number];

    const styleFixups: {
        el: HTMLElement;
        styles: Partial<Record<ColorProperty, string>>;
    }[] = [];

    const copySanitizedStyles = (sourceEl: HTMLElement, targetEl: HTMLElement) => {
        const computed = window.getComputedStyle(sourceEl);
        colorProperties.forEach((property) => {
            const computedValue = computed[property];
            if (computedValue) {
                targetEl.style[property] = computedValue;
            }
        });
    };

    const normalizeComputedStyles = (el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        const originalStyles: Partial<Record<keyof CSSStyleDeclaration, string>> = {};

        colorProperties.forEach((property) => {
            originalStyles[property] = el.style[property];
            const computedValue = computed[property];
            if (computedValue) {
                el.style[property] = computedValue;
            }
        });

        styleFixups.push({ el, styles: originalStyles });
    };

    let walker: HTMLElement | null = element;
    while (walker) {
        const computed = window.getComputedStyle(walker);
        if (computed.overflow !== 'visible' || computed.overflowX !== 'visible') {
            overflowFixups.push({
                el: walker,
                overflow: walker.style.overflow,
                overflowX: walker.style.overflowX,
            });
            walker.style.overflow = 'visible';
            walker.style.overflowX = 'visible';
        }
        walker = walker.parentElement;
    }

    normalizeComputedStyles(element);
    element.querySelectorAll<HTMLElement>('*').forEach((child) => {
        normalizeComputedStyles(child);
    });


    try {
        // Size the page in CSS pixels so the image is embedded at EXPORT_SCALE dpi
        // rather than producing an oversized page.
        const buildPdfFromImage = (imgData: string, pageWidth: number, pageHeight: number) => {
            const pdf = new jsPDF({
                orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [pageWidth, pageHeight],
                compress: true,
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            pdf.save(filename);
        };

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#FFFBF0',
                scale: EXPORT_SCALE,
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc: Document) => {
                    const clonedElement = clonedDoc.getElementById(elementId);
                    if (!clonedElement) return;

                    copySanitizedStyles(element, clonedElement as HTMLElement);

                    const originalNodes = element.querySelectorAll<HTMLElement>('*');
                    const clonedNodes = clonedElement.querySelectorAll<HTMLElement>('*');
                    originalNodes.forEach((originalNode, index) => {
                        const clonedNode = clonedNodes[index];
                        if (!clonedNode) return;
                        copySanitizedStyles(originalNode, clonedNode);
                    });
                },
                ignoreElements: (el: Element) => {
                    return el.tagName === 'IFRAME';
                },
            });

            buildPdfFromImage(
                canvas.toDataURL('image/jpeg', JPEG_QUALITY),
                canvas.width / EXPORT_SCALE,
                canvas.height / EXPORT_SCALE,
            );
        } catch (error) {
            console.warn('html2canvas failed, falling back to html-to-image:', error);
            try {
                const imgData = await toJpeg(element, {
                    backgroundColor: '#FFFBF0',
                    cacheBust: true,
                    pixelRatio: EXPORT_SCALE,
                    quality: JPEG_QUALITY,
                    canvasWidth: element.scrollWidth,
                    canvasHeight: element.scrollHeight,
                    skipAutoScale: true,
                });

                buildPdfFromImage(imgData, element.scrollWidth, element.scrollHeight);
            } catch (fallbackError) {
                console.error('Fallback PDF export failed:', fallbackError);
                throw error; // Throw the original html2canvas error for better debugging logs
            }
        }
    } catch (error: unknown) {
        console.error('Error generating PDF:', error);
        const message = error instanceof Error ? error.message : String(error);
        window.alert('PDF Export Error: ' + message);
        throw error;
    } finally {
        // Always restore original overflow values
        for (const fix of overflowFixups) {
            fix.el.style.overflow = fix.overflow;
            fix.el.style.overflowX = fix.overflowX;
        }
        for (const fix of styleFixups) {
            for (const property of colorProperties) {
                fix.el.style[property] = fix.styles[property] ?? '';
            }
        }
    }
};
