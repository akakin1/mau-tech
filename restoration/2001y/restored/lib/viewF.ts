export function viewF(res, level = 3.6) {
	// aspectの合計5までを区切る
	let aspectSum = 0;
	let result = [];
	let resChild = [];
	let aspectList = [];
	const flat = res.flat();
	flat.map((e, i) => {
		aspectSum += e.imgSize.aspect;
		// console.log(i);
		// console.log(e.imgSize);
		resChild.push(e);
		if (level <= aspectSum || i == flat.length - 1) {
			// 行終了
			aspectList.push(aspectSum);
			result.push(resChild);
			aspectSum = 0;
			resChild = [];
		}
	});
	result = result.map((e, i) => {
		let aspect = aspectList[i];
		return e.map((e1, i1) => {
			e1.imgSize.widthRate = e1.imgSize.aspect / aspect;
			e1.imgSize.aspectSum = aspect;
			// console.log(e1.imgSize.aspectSum)
			return e1;
		});
	});
	return result;
}
