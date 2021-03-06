import {addClass, relBounds, Rect, Direction, Point, removeClass} from "./utils";
import {Callout} from "./callout";
export class OffSiteIndicator {

    private _el: HTMLElement;
    private _nose: HTMLElement;
    private _body: HTMLElement;
    private _layoutData: OffSiteIndicatorLayoutData = new OffSiteIndicatorLayoutData();
    private _lastDirection: Direction = null;

    constructor(private _callout: Callout) {
        this._el = document.createElement('div');
        this._nose = document.createElement('div');
        this._body = document.createElement('div');
        this._el.appendChild(this._nose);
        this._el.appendChild(this._body);


        addClass(this._el, 'off-site-indicator');
        addClass(this._nose, 'nose');
        addClass(this._body, 'body');

        this.html = 'hello';
    }

    public calculateLayout(): void {

        let containerRect = Rect.fromBounds(relBounds(this._callout.container, this._callout.container));
        let anchorCenter = this._callout.connector.anchor.view.layoutData.rect.center;
        let indicatorRect = Rect.fromBounds(relBounds(this._callout.container, this._el));

        this._layoutData.point.x = anchorCenter.x - indicatorRect.width / 2;
        this._layoutData.point.y = anchorCenter.y - indicatorRect.height / 2;

        let minLeft = 0;
        let minTop = 0;
        let maxRight = containerRect.width - this._el.getBoundingClientRect().width;
        let maxBottom = containerRect.height - this._el.getBoundingClientRect().height;

        if (this._layoutData.point.x < minLeft) {
            this._layoutData.point.x = minLeft;
            this._layoutData.direction = Direction.West;
        }
        if (this._layoutData.point.x > maxRight) {
            this._layoutData.point.x = maxRight;
            this._layoutData.direction = Direction.East;
        }
        if (this._layoutData.point.y < minTop) {
            this._layoutData.point.y = minTop;
            this._layoutData.direction = Direction.North;
        }
        if (this._layoutData.point.y > maxBottom) {
            this._layoutData.point.y = maxBottom;
            this._layoutData.direction = Direction.South;
        }

        //if(this._layoutData.direction != null) console.log(Direction[this._layoutData.direction].toLowerCase());
    }

    public updateLayout(): void {

        this._el.style.left = this._layoutData.point.x + 'px';
        this._el.style.top = this._layoutData.point.y + 'px';

        if (this._layoutData.direction != this._lastDirection) {

            if (this._lastDirection != null) {
                removeClass(this._el, Direction[this._lastDirection].toLowerCase());
            }
            if (this._layoutData.direction != null) {
                addClass(this._el, Direction[this._layoutData.direction].toLowerCase());
            }

            this._lastDirection = this._layoutData.direction;
        }
    }

    public set html(html: string) {
        this._body.innerHTML = html;
    }

    public get html(): string {
        return this._el.innerHTML;
    }


    public addToStage(): void {


        this._callout.container.appendChild(this._el);
        this._el.style.visibility = 'hidden';
        this._el.style.transform = 'scale(1)';

    }



    public removeFromStage(): void {

        this._el.remove();
    }

    public show():void {

        this._el.style.visibility = 'visible';
        addClass(this._el, 'hidden');

        setTimeout(() => {
            removeClass(this._el, 'hidden');
        });
    }

    public hide():void {

        this._el.addEventListener('transitionend', this.onTransitionEnd);
        addClass(this._el, 'hidden');
    }

    onTransitionEnd(): void {

        this._el.removeEventListener('transitionend', this.onTransitionEnd);
        removeClass(this._el, 'hidden');
    };


}

export class OffSiteIndicatorLayoutData {

    constructor(public direction: Direction = null, public point: Point = null) {
        if (this.point == null) this.point = new Point();
    }
}