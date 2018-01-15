/**
 * Note : property "version" is injected from package.json
 */

module.exports = {

	/**
	 * Application base.
	 *
	 * - Let empty to work in relative mode.
	 * - No sub folders will be allowed in URLs after base.
	 * - ex :
	 * 		If application is installed here : http://domain.com/my-sub-folder/my-app/
	 * 		Pages with URLs like http://domain.com/my-sub-folder/my-app/another-sub/my-page.html will not work.
	 *
	 * OR
	 *
	 * - Set path from domain name to application. Starting and ending with slash.
	 * - ex :
	 * 		If application is installed here : http://domain.com/my-sub-folder/my-app/
	 * 		Base should be : "/my-sub-folder/my-app/"
	 * - ex :
	 * 		If application is installed here : http://domain.com/
	 * 		Base should be : "/"
	 */
	base: ''

};