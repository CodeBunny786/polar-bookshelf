import {DocMeta} from '../metadata/DocMeta';
import {PageMeta} from '../metadata/PageMeta';
import {isPresent} from '../Preconditions';
import {AnnotationType} from '../metadata/AnnotationType';
import {BaseHighlight} from '../metadata/BaseHighlight';
import {Screenshot} from '../metadata/Screenshot';
import {Screenshots} from '../metadata/Screenshots';
import {Text} from '../metadata/Text';
import {DocAnnotation} from './DocAnnotation';
import {AreaHighlight} from '../metadata/AreaHighlight';
import {TextHighlight} from '../metadata/TextHighlight';

export class DocAnnotations {

    public static getAnnotationsForPage(docMeta: DocMeta): DocAnnotation[] {

        // FIXME these must be sorted by their position in the document.

        const result: DocAnnotation[] = [];

        Object.values(docMeta.pageMetas).forEach(pageMeta => {
            result.push(...this.getTextHighlights(pageMeta));
            result.push(...this.getAreaHighlights(pageMeta));
        });

        return result;

    }

    public static createFromAreaHighlight(areaHighlight: AreaHighlight, pageMeta: PageMeta): DocAnnotation {

        const screenshot = this.getScreenshot(pageMeta, areaHighlight);

        return {
            id: areaHighlight.id,
            annotationType: AnnotationType.AREA_HIGHLIGHT,
            screenshot,
            html: undefined,
            pageNum: pageMeta.pageInfo.num,
            // FIXME MUST get the right position.
            position: {
                x: 0,
                y: 0
            }
        };

    }

    public static createFromTextHighlight(textHighlight: TextHighlight, pageMeta: PageMeta): DocAnnotation {

        let html: string = "";

        if (typeof textHighlight.text === 'string') {
            html = `<p>${textHighlight.text}</p>`;
        }

        if (isPresent(textHighlight.text)) {

            // TODO: move this to an isInstanceOf in Texts
            if ('TEXT' in <any> (textHighlight.text) || 'HTML' in <any> (textHighlight.text)) {

                const text = <Text> textHighlight.text;

                if (text.TEXT) {
                    html = `<p>${text.TEXT}</p>`;
                }

                if (text.HTML) {
                    html = text.HTML;
                }

            }

        }

        const screenshot = this.getScreenshot(pageMeta, textHighlight);

        return {
            id: textHighlight.id,
            annotationType: AnnotationType.TEXT_HIGHLIGHT,
            screenshot,
            html,
            pageNum: pageMeta.pageInfo.num,
            // FIXME MUST get the right position.
            position: {
                x: 0,
                y: 0
            }
        };

    }

    private static getTextHighlights(pageMeta: PageMeta): DocAnnotation[] {

        const result: DocAnnotation[] = [];

        Object.values(pageMeta.textHighlights).forEach(textHighlight => {
            result.push(this.createFromTextHighlight(textHighlight, pageMeta));
        });

        return result;

    }



    private static getAreaHighlights(pageMeta: PageMeta): DocAnnotation[] {

        const result: DocAnnotation[] = [];

        Object.values(pageMeta.areaHighlights).forEach(areaHighlight => {
            result.push(this.createFromAreaHighlight(areaHighlight, pageMeta));
        });

        return result;

    }


    private static getScreenshot(pageMeta: PageMeta, highlight: BaseHighlight): Screenshot | undefined {

        let screenshot: Screenshot | undefined;

        Object.values(highlight.images).forEach( image => {

            if (image.rel && image.rel === 'screenshot') {

                const screenshotURI = Screenshots.parseURI(image.src);

                if (screenshotURI) {
                    screenshot = pageMeta.screenshots[screenshotURI.id];
                }

            }

        });

        return screenshot;

    }

}
