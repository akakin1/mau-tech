import classNames from "classnames";
import Image from "next/image";
import c_imgLupe from "styles/components/imgLupe.module.scss";

export default function Output({ src, height, width, alt, position }) {
	// console.log(state_ImgLupe);
	
	return (
		<section className={c_imgLupe.view}>
			<div
				className={classNames(c_imgLupe.wrapper, {
					[c_imgLupe.open]: position,
				})}
				style={{
					"--positionX": position.x,
					"--positionY": position.y,
					"--width": width,
					"--height": height,
				}}
			>
				<Image src={src} alt={alt} width={width} height={height} />
			</div>
		</section>
	);
}
