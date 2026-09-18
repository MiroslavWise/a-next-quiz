import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "motion/react"

// 🎯 Изменено: сетка 8x5 вместо 16x9
const COLS = 8
const ROWS = 5

// Предварительно генерируем сетку вне компонента, чтобы не делать это при каждом рендере
const GRID = Array.from({ length: ROWS * COLS }).map((_, i) => {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const w = 100 / COLS
  const h = 100 / ROWS
  const x = col * w
  const y = row * h
  return {
    col,
    row,
    x,
    y,
    w,
    h,
    centerX: x + w / 2,
    centerY: y + h / 2,
  }
})

interface IProps {
  thumbUrl: string
  titleText: string
}

export function ImageThumb({ thumbUrl, titleText }: IProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Небольшая задержка, чтобы браузер успел отрисовать начальное состояние
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative mx-auto aspect-video w-full max-w-[min(100%,15rem)] shrink-0 overflow-hidden rounded-lg border border-(--accent-orb)/40">
      {isVisible &&
        GRID.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              // 🎯 Диагональная волна: чем дальше от левого верхнего угла, тем позже появляется
              // Для 8x5 шаг 0.03 даёт более плавную волну, чем 0.02
              delay: (cell.col + cell.row) * 0.03,
              // Если хотите полностью случайный порядок, замените на: delay: Math.random() * 0.5,
            }}
            className="absolute"
            style={{
              left: `${cell.x}%`,
              top: `${cell.y}%`,
              width: `${cell.w}%`,
              height: `${cell.h}%`,
              overflow: "hidden",
            }}
          >
            <Image
              fill
              src={thumbUrl}
              alt={titleText}
              sizes="(max-width: 640px) 15rem, (max-width: 1024px) 22rem, 27rem"
              className="object-cover"
              style={{
                // Сдвигаем картинку так, чтобы нужный кусочек совпал с ячейкой
                objectPosition: `${cell.centerX}% ${cell.centerY}%`,
              }}
            />
          </motion.div>
        ))}
    </div>
  )
}

ImageThumb.displayName = "ImageThumb"
export default ImageThumb
