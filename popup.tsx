import React, { useState, useEffect, useRef, type FormEvent, type FC } from "react"
import "./style.css"

interface Entries {
  [keyword: string]: string;
}

const IndexPopup: FC = () => {
  const [keyword, setKeyword] = useState<string>("")
  const [url, setUrl] = useState<string>("")
  const [entries, setEntries] = useState<Entries>({})
  const [editMode, setEditMode] = useState<boolean>(false)
  const [originalKeyword, setOriginalKeyword] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chrome.storage.local.get("entries", (result) => {
      const storedEntries = result.entries || {} as Entries
      setEntries(storedEntries)
    })
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const updatedEntries: Entries = { ...entries }
    
    if (editMode && originalKeyword !== keyword) {
      delete updatedEntries[originalKeyword]
    }

    updatedEntries[keyword] = url

    chrome.storage.local.set({ entries: updatedEntries })

    setEntries(updatedEntries)

    setKeyword("")
    setUrl("")
    setEditMode(false)
    setOriginalKeyword("")
  }
  
  const handleEdit = (key: string): void => {
    setKeyword(key)
    setUrl(entries[key])
    setEditMode(true)
    setOriginalKeyword(key)
  }
  
  const handleDelete = (key: string): void => {
    const updatedEntries: Entries = { ...entries }

    delete updatedEntries[key]

    chrome.storage.local.set({ entries: updatedEntries })

    setEntries(updatedEntries)

    if (editMode && originalKeyword === key) {
      setKeyword("")
      setUrl("")
      setEditMode(false)
      setOriginalKeyword("")
    }
  }
  
  const handleCancel = (): void => {
    setKeyword("")
    setUrl("")
    setEditMode(false)
    setOriginalKeyword("")
  }
  
  const handleExport = (): void => {
    const entriesJson = JSON.stringify(entries, null, 2)
    const blob = new Blob([entriesJson], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `go-shortcut-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
  }
  
  const handleImportClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const importedEntries = JSON.parse(e.target?.result as string) as Entries

        const updatedEntries: Entries = { ...entries, ...importedEntries }

        setEntries(updatedEntries)
        chrome.storage.local.set({ entries: updatedEntries })

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error importing entries:', error)
        alert('Error importing entries. Please make sure the file is a valid JSON export.')
      }
    }
    
    reader.readAsText(file)
  }

  return (
    <div className="container">
      <h2 className="heading">Go Shortcut Configuration</h2>
      
      <form onSubmit={handleSubmit} className="vertical-spacing">
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-text">Keyword</span>
          </label>
          <input 
            type="text" 
            placeholder="Enter keyword" 
            className="form-input full-width" 
            value={keyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-text">URL</span>
          </label>
          <input 
            type="url" 
            placeholder="https://example.com" 
            className="form-input full-width" 
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="button-group">
          <button type="submit" className="button button-primary full-width">
            {editMode ? "Update Shortcut" : "Save Shortcut"}
          </button>
          
          {editMode && (
            <button 
              type="button" 
              className="button button-secondary full-width" 
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="entries-section">
        <h3 className="subheading">Saved Shortcuts</h3>
        
        {Object.keys(entries).length === 0 ? (
          <p className="no-entries-message">No shortcuts saved yet.</p>
        ) : (
          <div className="entries-list vertical-spacing">
            {Object.entries(entries).map(([key, value]) => (
              <div key={key} className="entry-item">
                <div className="entry-details">
                  <div className="entry-keyword">{key}</div>
                  <div className="entry-url" title={value}>
                    {value}
                  </div>
                </div>
                <div className="entry-actions">
                  <button 
                    className="button button-icon" 
                    onClick={() => handleEdit(key)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="button button-icon" 
                    onClick={() => handleDelete(key)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="entries-section">
        <h3 className="subheading">Import/Export</h3>
        <div className="button-group vertical-spacing">
          <button 
            className="button button-primary full-width" 
            onClick={handleExport}
          >
            Export All Entries
          </button>
          <button 
            className="button button-secondary full-width" 
            onClick={handleImportClick}
          >
            Import Entries From File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <p className="signature">Made by <a href="https://alexishayat.me/" target="_blank">AlexisH</a> with ❤️</p>
    </div>
  )
}

export default IndexPopup
