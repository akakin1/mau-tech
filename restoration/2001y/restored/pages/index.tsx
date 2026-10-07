import { memo } from 'react';

import Head from "components/Head";
import WorksList from "components/widget/WorksList"

export default function Output({ res, cat }) {
	let title = "2001Y's Works";
	const WorksList_Memo = memo(WorksList);
	return (
		<>
			<Head title={title} />
			<WorksList_Memo cat={cat} res={res} lock={false} />
		</>
	);
}
import { GETwpList } from "lib/fetch";
export async function getStaticProps() {
	let [res, cat] = await Promise.all([
		GETwpList("/works"),
		GETwpList("/works_cat"),
	]);
	res.map(e => e.content = "");
	return {
		props: {
			res,
			cat
		},
	};
}