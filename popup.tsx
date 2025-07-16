import React, { useState, useEffect, type FormEvent, type FC } from "react"
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
    </div>
  )
}

export default IndexPopup
