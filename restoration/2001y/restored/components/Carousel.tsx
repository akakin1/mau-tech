import { useRef, useEffect, useState, useCallback } from 'react';
import WorkImage from 'components/WorkImage';
import c_carousel from "styles/components/carousel.module.scss"
import classNames from "classnames";

const EMBED_HOSTS = new Set(["www.figma.com", "embed.figma.com", "www.youtube.com", "player.vimeo.com"]);

function renderEmbedCode(code) {
    if (typeof code !== "string") return null;
    const source = code.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1];
    if (!source) return null;
    try {
        const url = new URL(source);
        if (url.protocol !== "https:" || !EMBED_HOSTS.has(url.hostname)) return null;
        return (
            <iframe
                src={url.toString()}
                title="埋め込みコンテンツ"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    } catch {
        return null;
    }
}

export default function Embed({ res, imgSize }) {

    const containerRef = useRef(null);
    const [zoomState, setZoomState] = useState(false);
    const [moduleState, setModuleState] = useState(true);
    const [nextState, setNextState] = useState(false);
    const [prevState, setPrevState] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeAspect = Number(res[activeIndex]?.aspect || imgSize?.aspect || 1);

    const handleScroll = useCallback((direction) => {
        if (!containerRef.current) return;
        if (direction === 'next') {
            containerRef.current.scrollLeft += containerRef.current.offsetWidth;
        } else if (direction === 'prev') {
            containerRef.current.scrollLeft -= containerRef.current.offsetWidth;
        }
    }, []);

    const handleContentScroll = useCallback(() => {
        if (!containerRef.current) return;
        setModuleState(false);
        const slideWidth = containerRef.current.offsetWidth;
        if (!slideWidth) return;
        const nextIndex = Math.round(containerRef.current.scrollLeft / slideWidth);
        setActiveIndex(Math.max(0, Math.min(nextIndex, res.length - 1)));
    }, [res.length]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'ArrowRight') {
            setNextState(true)
        } else if (event.key === 'ArrowLeft') {
            setPrevState(true)
        }
    }, []);
    const handleKeyUp = useCallback((event) => {
        if (event.key === 'ArrowRight') {
            handleScroll('next');
            setNextState(false)
        } else if (event.key === 'ArrowLeft') {
            handleScroll('prev');
            setPrevState(false)
        } else if (event.key === 'Escape') {
            zoomState && setZoomState(false);
        }

    }, [handleScroll, zoomState]);
    const toggleZoom = useCallback(() => setZoomState((current) => !current), []);
    const handleZoomKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleZoom();
        }
    }, [toggleZoom]);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        window.document.documentElement.setAttribute("data-header", String(!zoomState));
        return () => document.documentElement.setAttribute("data-header", "true");
    }, [zoomState]);

    return (
        <div
            className={classNames(
                c_carousel.thumbnail,
                { [c_carousel.zoom]: zoomState }
            )}
            style={{
                "--aspect": activeAspect,
            } as any}
        >
            <div
                className={classNames(
                    c_carousel.carousel,
                    { [c_carousel.zoom]: zoomState }
                )}
                onDoubleClick={toggleZoom}
            >
                <div className={c_carousel.contents} ref={containerRef} onScroll={handleContentScroll}>
                    {res.map((embed, index) => (
                        <div
                            key={embed.id || embed.image || embed.youtube || embed.name || embed.code || "embed"}
                            style={{
                                "--slide-aspect": Number(embed.aspect || imgSize?.aspect || 1),
                            } as any}
                        >
                            {embed.image && (
                                <WorkImage
                                    sizes="(max-width: 800px) 100vw, 830px"
                                    fullResolution={zoomState && index === activeIndex}
                                    src={embed.image}
                                    alt={embed.name || "作品画像"}
                                    width={embed.width || 830}
                                    height={embed.height || Math.round((embed.width || 830) / Number(embed.aspect || imgSize?.aspect || 1))}
                                    unoptimized
                                />
                            )}
                            {embed.code && (
                                renderEmbedCode(embed.code)
                            )}
                            {embed.youtube && (
                                <iframe
                                    // className={classNames(c_works.youtube, {
                                    //     [c_works.play]: state_youtube,
                                    // })}
                                    src={
                                        "https://www.youtube.com/embed/" +
                                        embed.youtube +
                                        "?autoplay=1"
                                    }
                                    title={res.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>
                    ))}
                </div>


                <div
                    className={classNames(
                        c_carousel.buttonList,
                        { [c_carousel.active]: nextState }
                    )}
                >
                    {(res.length > 1) && (
                        <button
                            className={classNames(
                                c_carousel.prevButton,
                                { [c_carousel.active]: prevState }
                            )}
                            type="button"
                            aria-label="前の作品"
                            onClick={() => handleScroll('prev')}
                        >
                            ＜
                        </button>
                    )}
                    <button
                        className={classNames(
                            c_carousel.zoomButton,
                            { [c_carousel.active]: zoomState }
                        )}
                        type="button"
                        aria-label={zoomState ? "ズームを解除" : "画像を拡大"}
                        onClick={toggleZoom}
                    >
                        □
                    </button>
                    {(res.length > 1) && (
                        <button
                            className={classNames(
                                c_carousel.nextButton,
                                { [c_carousel.active]: nextState }
                            )}
                            type="button"
                            aria-label="次の作品"
                            onClick={() => handleScroll('next')}
                        >
                            ＞
                        </button>
                    )}
                </div>
                {(res.length > 1) && (
                    <button
                        type="button"
                        className={classNames(
                            c_carousel.module,
                            { [c_carousel.open]: moduleState }
                        )}
                        aria-label="操作説明を閉じる"
                        aria-hidden={!moduleState}
                        tabIndex={moduleState ? 0 : -1}
                        onClick={() => setModuleState(false)}
                    >
                        矢印キー や 横スクロール でも操作できます。
                    </button>
                )}
            </div>

            <button
                type="button"
                className={classNames(
                    c_carousel.zoomBackground,
                    { [c_carousel.zoom]: zoomState }
                )}
                aria-label="ズームを解除"
                aria-hidden={!zoomState}
                tabIndex={zoomState ? 0 : -1}
                onClick={toggleZoom}
                onKeyDown={handleZoomKeyDown}
            >
            </button>

        </div>
    );
}
