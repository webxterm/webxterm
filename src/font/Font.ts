
export class Font {

    protected fontSizes: { [pt: string]: number[] } = {};

    getFontSize(pt: string): number[] {
        return this.fontSizes[pt];
    }

    getFontName(): string {
        return "";
    }

    getLineHeight(): number {
        return 1;
    }

}