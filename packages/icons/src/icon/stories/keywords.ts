const keywords: Partial< Record< keyof typeof import('../../'), string[] > > = {
	cancelCircleFilled: [ 'close' ],
	cautionFilled: [ 'alert', 'caution', 'warning' ],
	create: [ 'add' ],
	file: [ 'folder' ],
	seen: [ 'show' ],
	thumbsDown: [ 'dislike' ],
	thumbsUp: [ 'like' ],
	trash: [ 'delete' ],
	unseen: [ 'hide' ],
};

export default keywords;
