import {Callout} from "./callout";
import {addClass, removeClass, Direction, Rect, Point} from "./utils";

export abstract class WeldingSeamView {

    protected _el: HTMLElement;

    protected _layoutData: WeldLayoutData = new WeldLayoutData();

    constructor(protected _callout: Callout) {

        this._el = document.createElement('div');
        this._el.setAttribute('class', 'ac-welding-seam');
    }

    public show(): void {

        this._callout.container.appendChild(this._el);
    }

    public hide(): void {

        this._el.remove();
    }

    get layoutData(): WeldLayoutData {
        return this._layoutData;
    }

    public abstract fadeIn(): Promise<void>;

    public abstract fadeOut(): Promise<void>;


    public abstract get weldSide(): Direction;

    public abstract calculateLayout(bodyRect?: Rect): void;

    public abstract updateLayout(): void;
}


export class DefaultWeldingSeamView extends WeldingSeamView {

    private _scale: number = 1;

    private _transformOrigin: Direction;

    protected _angle: number;

    private _lastWeldSide: Direction;

    constructor(protected _callout: Callout) {
        super(_callout);
        addClass(this._el, 'default');
    }


    get weldSide(): Direction {
        return this._layoutData.weldSide;
    }

    public calculateLayout(): void {

        //let anchorRect = Rect.fromBounds(this._callout.connector.anchor.view.bounds);
        let anchorCenter = this._callout.connector.anchor.view.center;
        let bodyRect = this._callout.body.view.layoutData.rect;
        this._layoutData.weldPoint = this._callout.body.view.layoutData.closestPoint;

        let layoutData = new WeldLayoutData();

        let a = this._layoutData.weldPoint.x - anchorCenter.x;
        let b = this._layoutData.weldPoint.y - anchorCenter.y;

        layoutData.angle = Math.asin(b / Math.sqrt(a * a + b * b));
        console.log(layoutData.angle);

        if (anchorCenter.x < bodyRect.x2-bodyRect.width/2) {

            if (layoutData.angle < -1 * Math.PI / 4) {

                layoutData.transformOrigin = Direction.SouthWest;
                layoutData.weldSide = Direction.South;
                if( bodyRect.x1 > anchorCenter.x) {
                    layoutData.weldPoint = new Point(bodyRect.x1, bodyRect.y2);
                }else{
                    layoutData.weldPoint = new Point(anchorCenter.x, bodyRect.y2);
                }

                layoutData.rect = new Rect(
                    bodyRect.x1,
                    bodyRect.y2 - this._callout.connector.view.lineWidth,
                    bodyRect.width,
                    this._callout.connector.view.lineWidth
                );

            } else if (layoutData.angle > Math.PI / 4) {

                layoutData.transformOrigin = Direction.NorthWest;
                layoutData.weldSide = Direction.North;
                if( bodyRect.x1 > anchorCenter.x) {
                    layoutData.weldPoint = new Point(bodyRect.x1, bodyRect.y1);
                }else{
                    layoutData.weldPoint = new Point(anchorCenter.x, bodyRect.y1);
                }

                layoutData.rect = new Rect(
                    bodyRect.x1,
                    bodyRect.y1,
                    bodyRect.width,
                    this._callout.connector.view.lineWidth
                );

            } else {

                if(anchorCenter.y > bodyRect.y2) {
                    layoutData.transformOrigin = Direction.SouthWest;
                    layoutData.weldPoint = new Point(bodyRect.x1, bodyRect.y2);
                } else if(anchorCenter.y < bodyRect.y1) {
                    layoutData.transformOrigin = Direction.NorthWest;
                    layoutData.weldPoint = new Point(bodyRect.x1, bodyRect.y1);
                } else {
                    layoutData.transformOrigin = Direction.West;
                    layoutData.weldPoint = new Point(bodyRect.x1, anchorCenter.y);
                }
                layoutData.weldSide = Direction.West;
                layoutData.rect = new Rect(
                    bodyRect.x1,
                    bodyRect.y1,
                    this._callout.connector.view.lineWidth,
                    bodyRect.height
                );
            }

        } else {

            if (layoutData.angle < -1 * Math.PI / 4) {

                layoutData.transformOrigin = Direction.SouthEast;
                layoutData.weldSide = Direction.South;

                if( bodyRect.x2 < anchorCenter.x) {
                    layoutData.weldPoint = new Point(bodyRect.x2, bodyRect.y2);
                }else{
                    layoutData.weldPoint = new Point(anchorCenter.x, bodyRect.y2);
                }
                layoutData.rect = new Rect(
                    bodyRect.x1,
                    bodyRect.y2 - this._callout.connector.view.lineWidth,
                    bodyRect.width,
                    this._callout.connector.view.lineWidth
                );

            } else if (layoutData.angle > Math.PI / 4) {

                layoutData.transformOrigin = Direction.NorthEast;
                layoutData.weldSide = Direction.North;
                if( bodyRect.x2 < anchorCenter.x) {
                    layoutData.weldPoint = new Point(bodyRect.x2, bodyRect.y1);
                }else{
                    layoutData.weldPoint = new Point(anchorCenter.x, bodyRect.y1);
                }
                layoutData.rect = new Rect(
                    bodyRect.x1,
                    bodyRect.y1,
                    bodyRect.width,
                    this._callout.connector.view.lineWidth
                );

            } else {

                if( anchorCenter.y > bodyRect.y2) {
                    layoutData.transformOrigin = Direction.SouthEast;
                    layoutData.weldPoint = new Point(bodyRect.x2, bodyRect.y2);
                } else if(anchorCenter.y < bodyRect.y1) {
                    layoutData.transformOrigin = Direction.NorthEast;
                    layoutData.weldPoint = new Point(bodyRect.x2, bodyRect.y1);
                }else  {
                    layoutData.transformOrigin = Direction.East;
                    layoutData.weldPoint = new Point(bodyRect.x2, anchorCenter.y);
                }
                layoutData.weldSide = Direction.East;
                layoutData.rect = new Rect(
                    bodyRect.x2 - this._callout.connector.view.lineWidth,
                    bodyRect.y1,
                    this._callout.connector.view.lineWidth,
                    bodyRect.height
                );
            }
        }
        this._layoutData = layoutData;
    }

    public updateLayout(): void {

        this._el.style.left = this._layoutData.rect.x1 + 'px';
        this._el.style.top = this._layoutData.rect.y1 + 'px';
        this._el.style.width = this._layoutData.rect.width + 'px';
        this._el.style.height = this._layoutData.rect.height + 'px';

        if (this._layoutData.weldSide != this._lastWeldSide) {

            if (this._lastWeldSide != null) removeClass(this._el, Direction[this._lastWeldSide].toLowerCase());
            addClass(this._el, Direction[this._layoutData.weldSide].toLowerCase());
            this._lastWeldSide = this._layoutData.weldSide;
        }
    }

    animate(fadeIn: boolean): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            let startTime = Date.now();
            let endTime = startTime + 200;

            let xOrigin: string = null;
            let yOrigin: string = null;

            console.log(Direction[this.layoutData.transformOrigin].toString());


            if (this._layoutData.weldSide == Direction.West) {

                yOrigin = this.layoutData.transformOrigin == Direction.NorthWest ? 'top' : (this.layoutData.transformOrigin == Direction.SouthWest ? 'bottom' : 'center');

            } else if (this.layoutData.weldSide == Direction.North) {

                xOrigin = this.layoutData.transformOrigin == Direction.NorthWest ? 'left' : (this.layoutData.transformOrigin == Direction.NorthEast ? 'right' : 'center');

            } else if (this.layoutData.weldSide == Direction.East) {

                yOrigin = this.layoutData.transformOrigin == Direction.SouthEast ? 'bottom' : (this.layoutData.transformOrigin == Direction.NorthEast ? 'top' : 'center');

            } else {

                xOrigin = this.layoutData.transformOrigin == Direction.SouthEast ? 'right' : (this.layoutData.transformOrigin == Direction.SouthWest ? 'left' : 'center');
            }

            if (xOrigin != null) {
                this._el.style.transformOrigin = xOrigin + ' top';
            } else {
                this._el.style.transformOrigin = 'left ' + yOrigin;
            }

            if (this._layoutData.weldSide == Direction.East || this._layoutData.weldSide == Direction.West) {
                this._el.style.transform = fadeIn ? 'scaleY(0)' : 'scaleY(1)';
            } else {
                this._el.style.transform = fadeIn ? 'scaleX(0)' : 'scaleX(1)';
            }

            let loop = () => {

                let now = Date.now();

                if (now < endTime) {

                    let ratio = (now - startTime) / (endTime - startTime);
                    this._scale = fadeIn ? ratio : 1 - ratio;

                    requestAnimationFrame(loop);

                } else {

                    this._scale = fadeIn ? 1 : 0;
                    this._el.style.transform = null;
                    resolve();
                }
                this._el.style.transform = ((this._layoutData.weldSide == Direction.East || this._layoutData.weldSide == Direction.West) ? 'scaleY(' : 'scaleX(') + this._scale + ')';

            };
            requestAnimationFrame(loop);
        });
    }

    public fadeIn(): Promise<void> {

        this.show();
        return this.animate(true);
    }

    public fadeOut(): Promise<void> {
        return this.animate(false).then(() => {
            this.hide();
        });
    }


}

export class WeldLayoutData {

    constructor(public angle: number = 0,
                public rect: Rect = null,
                public weldSide: Direction = null,
                public weldPoint: Point = null,
                public transformOrigin: Direction = null) {

        if (rect == null) this.rect = new Rect();
        if (weldPoint == null) this.weldPoint = new Point();
    }
}