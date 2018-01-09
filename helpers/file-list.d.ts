


declare export class FileList
{
	glob	:string;
	files	:string[];

	constructor (pGlob:boolean, pOnlyFiles?:boolean);

	exists ():boolean;

	all( pHandler : (file:string) => void ):string[];

	delete ();

	moveTo (pGlob:string);

	copyTo (pGlob:string);
}

declare export const Files = pGlob => new FileList(pGlob, true);

declare export const Folders = pGlob => new FileList(pGlob, false);