import Sine = gsap.Sine;
import Power3 = gsap.Power3;
import TweenLite = gsap.TweenLite;

export class Main
{
	protected x:number = 0;

	constructor ()
	{
		//this.x = "test";

		//console.log('gsap', gsap);

		//console.log('GreenSockGlobals', GreenSockGlobals);
		console.log('TweenLite', TweenLite);

		TweenLite.to(this, 1, {
			x: 1000,
			ease: Sine.easeOut,
			onUpdate: () =>
			{
				console.log('ok 2', this.x);
			}
		});
	}
}

new Main();