import './App.css'
import { useState, type ChangeEvent } from 'react'

function App() {

  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [frameRatio, setFrameRatio] = useState(0.01)
  const [previewDimensions, setPreviewDimensions] = useState({
    width: 0,
    height: 0,
  })
  const framePadding = Math.round(
    Math.min(previewDimensions.width, previewDimensions.height) * frameRatio,
  )

  const RATIO_MIN = 0.01
  const RATIO_MAX = 0.25

  const progressPercent =
    ((frameRatio - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setFileName(file.name)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function resetImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setFileName(null)
  }

  function buildDownloadName(originalName: string | null) {
    if (!originalName) return 'photo-frame.jpg'

    const lastDotIndex = originalName.lastIndexOf('.')
    const nameWithoutExtension =
      lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName

    return `${nameWithoutExtension}-frame.jpg`
  }

  async function handleDownload() {
    if (!previewUrl) return

    const image = new Image()
    image.src = previewUrl

    await image.decode()

    const margin = Math.round(
      Math.min(image.naturalWidth, image.naturalHeight) * frameRatio,
    )

    const canvas = document.createElement('canvas')

    canvas.width = image.naturalWidth + margin * 2
    canvas.height = image.naturalHeight + margin * 2

    const context = canvas.getContext('2d')

    if (!context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.drawImage(
      image,
      margin,
      margin,
      image.naturalWidth,
      image.naturalHeight,
    )

    canvas.toBlob((blob) => {
      if (!blob) return

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = buildDownloadName(fileName)
      link.click()

      URL.revokeObjectURL(downloadUrl)
    }, 'image/jpeg', 0.92)
  }

  return (
    <main className="page">

    {previewUrl ? (

      <section className="editor">

        <div className="preview-stage">
          <div
            className="photo-frame"
            style={{ padding: `${framePadding}px` }}
          >
            <img
              className="image-preview"
              src={previewUrl}
              alt="Preview of selected image"
              onLoad={(event) => {
                setPreviewDimensions({
                  width: event.currentTarget.clientWidth,
                  height: event.currentTarget.clientHeight,
                })
              }}
            />
          </div>
        </div>

        <label className="frame-control">
          <span>
            Border size
            <output>{Math.round(frameRatio * 100)}%</output>
          </span>

          <input
            type="range"
            min={RATIO_MIN}
            max={RATIO_MAX}
            step="0.01"
            value={frameRatio}
            onChange={(event) => setFrameRatio(Number(event.target.value))}
            style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
          />
        </label>

        <div className="editor-buttons">
          <button className="button" onClick={handleDownload}>
            Download image
          </button>

          <button className="text-button" onClick={resetImage}>
            Change photo
          </button>
        </div>

      </section>

    ) : (
      
      <section className="frame-box">

        <h1>
          Add a white border
          <br />
          to any photo.
        </h1>

        <label className="button">
          Upload image
          <input
            className="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </label>
      </section>
    )}
    </main>
  )
}

export default App
