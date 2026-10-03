import Image from "next/image"

interface IProps {
  thumbUrl: string
  titleText: string
}

function ImageThumb({ thumbUrl, titleText }: IProps) {
  return (
    <div className="question-thumb-reveal relative mx-auto aspect-video w-full max-w-[min(100%,15rem)] shrink-0 overflow-hidden rounded-lg border border-(--accent-orb)/40 bg-white/6 sm:max-w-[min(100%,22rem)] lg:max-w-[min(100%,27rem)]">
      <Image
        fill
        src={thumbUrl}
        alt={titleText}
        sizes="(max-width: 640px) 15rem, (max-width: 1024px) 22rem, 27rem"
        className="object-cover"
      />
    </div>
  )
}

ImageThumb.displayName = "ImageThumb"
export default ImageThumb
