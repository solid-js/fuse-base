


declare export class FileList
{
	constructor (pGlob:boolean, pOnlyFiles?:boolean);

	exists ():boolean;

	all( pHandler : (file:string) => void ):string[];

	delete ();

	moveTo (pGlob:string);

	copyTo (pGlob:string);
}

declare export const Files = pGlob => new FileList(pGlob, true);

declare export const Folder = pGlob => new FileList(pGlob, false);