import './App.css'
import { useState, type ChangeEvent } from 'react'

function App() {

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [frameRatio, setFrameRatio] = useState(0.08)
  const [previewDimensions, setPreviewDimensions] = useState({
    width: 0,
    height: 0,
  })
  const framePadding = Math.round(
    Math.min(previewDimensions.width, previewDimensions.height) * frameRatio,
  )

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function resetImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
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
      link.download = 'photo-with-white-border.jpg'
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
            min="0.01"
            max="0.15"
            step="0.01"
            value={frameRatio}
            onChange={(event) => setFrameRatio(Number(event.target.value))}
          />
        </label>

        <button className="button" onClick={handleDownload}>
          Download image
        </button>

        <button className="button" onClick={resetImage}>
          Change image
        </button>
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
