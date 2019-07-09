import "AppView.less";
import {createElement} from "react";
import {ReactView} from "solidify-lib/react/ReactView";
import {
    ETransitionType,
    ReactViewStack
} from "solidify-lib/react/ReactViewStack";
import {IPage} from "solidify-lib/navigation/IPage";
import {IRouteMatch, Router} from "solidify-lib/navigation/Router";

// ----------------------------------------------------------------------------- STRUCT

export interface Props {

}

export interface States {
    // Declare states with ? to allow them to be set without sending all state back
    // myStateProp  ?:  string;
}


export class AppView extends ReactView<Props, States> {
    // React view stack, showing pages when route changes
    protected _viewStack: ReactViewStack;


    // ------------------------------------------------------------------------- INIT

    prepare() {
        // Init state here, you can set from props
        this.initState({
            // ...
        });
    }

    // ------------------------------------------------------------------------- RENDERING

    render() {
        return <div className="AppView" ref="root">

            {/* View stack showing pages */}
            <ReactViewStack
                ref={r => this._viewStack = r}
                transitionType={ETransitionType.PAGE_SEQUENTIAL}
                transitionControl={this.transitionControl.bind(this)}
                onNotFound={this.pageNotFoundHandler.bind(this)}
            />
        </div>
    }

    // ------------------------------------------------------------------------- LIFECYCLE

    componentDidMount() {
        // Setup viewStack to show pages from Router automatically
        Router.registerStack('main', this._viewStack);

        // Listen to routes not found
        Router.onNotFound.add(this.routeNotFoundHandler, this);
        Router.onRouteChanged.add(this.routeChangedHandler, this);
    }

    componentWillUnmount() {
        Router.onNotFound.remove(this.routeNotFoundHandler);
        Router.onNotFound.remove(this.routeChangedHandler);
    }

    componentDidUpdate(pPrevProps: Props, pPrevState: States) {

    }

    // ------------------------------------------------------------------------- HANDLERS

    /**
     * Transition manager between all React pages.
     * Useful if you want a custom transition behavior other than PAGE_SEQUENTIAL or PAGE_CROSSED.
     * You can setup a generic transition between all pages and do special cases here.
     * If you want to act on pages beyond just playIn and playOut methods, it's recommended to create an interface or an abstract.
     * To enable this feature, set prop transitionType to ETransitionType.CONTROLLED onto ReactViewStack component.
     * @param {HTMLElement} $oldPage Old page HTMLElement. Can be null.
     * @param {HTMLElement} $newPage New page HTMLElement.
     * @param {IPage} pOldPage Old page component instance. Can be null.
     * @param {IPage} pNewPage New page component instance.
     * @return {Promise<any>}
     */
    protected transitionControl($oldPage: HTMLElement, $newPage: HTMLElement, pOldPage: IPage, pNewPage: IPage): Promise<any> {
        return new Promise(async resolve => {
            // You can implement your transition here

            // Do not forget to call playIn and playOut on pages.
            pOldPage != null && pOldPage.playOut();
            await pNewPage.playIn();

            // All done
            resolve();
        });
    }

    /**
     * When route has changed
     */
    protected routeChangedHandler(pRouteMatch: IRouteMatch) {
        console.log('Route changed', pRouteMatch);
    }

    /**
     * When a route is not found
     */
    protected routeNotFoundHandler(...rest) {
        console.error('ROUTE NOT FOUND', rest);
    }

    /**
     * When a page is not found
     * @param {string} pPageName
     */
    protected pageNotFoundHandler(pPageName: string) {
        console.error('PAGE NOT FOUND', pPageName);
    }

    // ------------------------------------------------------------------------- STATES


}