import "./HomePage.less";
import {createElement} from "react";
import {ReactPage, ReactPageProps} from "solidify-lib/react/ReactPage";
import {Router} from "solidify-lib/navigation/Router";

// ----------------------------------------------------------------------------- STRUCT

interface States {

}

export class HomePage extends ReactPage<ReactPageProps, States> {

    // ------------------------------------------------------------------------- INIT

    prepare() {

    }

    // ------------------------------------------------------------------------- RENDERING

    render() {
        return <div className="HomePage" ref="root">

            <h1>HomePage</h1>
            <ul>
                <li>
                    <a
                        href={Router.generateURL({
                            page: 'ProductOverviewPage'
                        })}
                        data-internal-link
                    >Products overview</a>
                </li>
                <li>
                    <a
                        href={Router.generateURL({
                            page: 'ProductDetailPage',
                            parameters: {
                                id: 5,
                                slug: 'my-product'
                            }
                        })}
                        data-internal-link
                    >Product detail</a>
                </li>
            </ul>
        </div>
    }

    // ------------------------------------------------------------------------- PAGE

    /**
     * Action on this page.
     * Check props.action and props.parameters to show proper content.
     */
    action() {
        // Remove if not used
    }

    /**
     * Play in animation.
     * Call complete handler when animation is done.
     */
    protected playInPromiseHandler(pCompleteHandler: () => void) {
        pCompleteHandler();
    }

    /**
     * Play out animation.
     * Call complete handler when animation is done.
     */
    protected playOutPromiseHandler(pCompleteHandler: () => void) {
        pCompleteHandler();
    }
}

// Also export as default
export default HomePage;