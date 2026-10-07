import Link from "next/link";
import WorkImage from "components/WorkImage";
import c_works from "styles/works.module.scss";
import useSWR from "swr";
import classNames from "classnames";
import Router, { useRouter } from "next/router";

export default function Output({ res, countSum }) {
	const router = useRouter();
	let dynamicRoutesName = router.pathname.split(/\[|\]/)[1];
	const queryParams = { ...router.query };
	delete queryParams[dynamicRoutesName];

	return (
		<>
			<li
				className={c_works.work}
				style={{
					"--aspectSum": res.imgSize.aspectSum,
					"--aspect": res.imgSize.aspect,
					"--gapCount": countSum - 1,
				}}
			>
				<Link legacyBehavior
					href={{
						pathname: "/works/" + decodeURI(res.slug),
						query: { ...queryParams },
					}}
					shallow={true}
				>
					<a>
						{res.cfs.img && (
							<div
								className={classNames(c_works.tmb, {
									[c_works.youtube]: res.cfs.youtube,
								})}
							>
								<WorkImage
									sizes="(max-width: 800px) 65vw, 50vw"
									alt={res.title + "のサムネイル"}
									src={res.cfs.img}
									height={400}
									width={400 * res.imgSize.aspect}
									unoptimized
								/>
							</div>
						)}
						{res.category && (
							<ul className={classNames(c_works.categoryList)}>
								{res.category.map((e2) => (
									<li key={e2.slug || e2.id || e2.name}>{e2.name}</li>
								))}
							</ul>
						)}
						<div className={c_works.meta}>
							<h3
								className={c_works.list_title}
							>{res.title}</h3>
							<ul>
								{res.tags && (
									<li>
										<ul className={c_works.tagList}>
											{res.tags.map((e2) => (
												<li key={e2.slug || e2.id || e2.name}>#{e2.name}</li>
											))}
										</ul>
									</li>
								)}
							</ul>
						</div>
					</a>
				</Link>
			</li>
		</>
	);
}
