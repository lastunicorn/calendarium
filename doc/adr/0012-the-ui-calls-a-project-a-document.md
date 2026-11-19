# 0012. The UI calls a project a document

- Status: Accepted; the stored data's names superseded by [0013](0013-the-stored-data-says-document.md)
- Date: 2026-11-18

## Context

The sidebar called one calendar being made a project ("New project…", "Open a project file"). "Project" sounds heavier than what it names, one calendar's name, layout and options. "Profile" was considered and rejected: it reads as the viewer's own settings, which the app already has as its preferences. "Calendar" is the user's own word, but it already names the Calendar section and several things in the code. "Document" says what it is, a thing made, named, opened, saved to a file and printed, as in any editor.

Renaming the code and the stored data too was possible before 6.0.0's release, but `Document` and `document` are the DOM's own type and global, which a domain type of that name would shadow throughout `ui/`.

## Decision

The UI says document: the Document section, New document…, Change document…, Delete document, Open a document file, Save document to a file, the Open document and New document dialogs, the notices. The code, the docs about the code and the serialized project keep project (`Project`, `PROJECT_FORMAT` = `calendarium/project`, `calendarium-project:<id>`; these two are now `calendarium/document` and `calendarium-document:<id>`, [0013](0013-the-stored-data-says-document.md)); the glossary gives both, the sidebar label beside the term.

## Consequences

- No migration, and no type shadowing the DOM's.
- Code and UI use two words for one thing: a comment or test quoting a label quotes the UI's (the Change document button), one naming the concept says project.
- Revisit if the two words cause confusion; renaming the code after 6.0.0 needs a major release for the format and storage keys.
