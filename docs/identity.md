# Identity

This file is the one source of the Level One identity's faces outside the site. Every design-tools token instance that declares an identity face set takes its faces from this file, through the generator in the design-tools repository, and a test there fails when an instance disagrees with it.

The identity has two parts, and each value lives in one of them:

- The site's CSS token files hold everything the site sets: the palette in `src/styles/tokens/colors.css`, the spacing in `spacing.css`, and the leading ramp and each role's web font stack in `typography.css`. For where each token family lives, see [design/tokens.md](design/tokens.md).
- This file holds what the site never sets: the house face for each print role, by optical cut, the faces a lecture uses on a venue machine, and the identity's name.

## Faces by role

The house set is Michael's licensed faces, installed by hand on each Mac. The web set is the open-licence lookalikes the site loads, one per role, which an artifact uses when it can't reach an installed house face:

| Role | House face | Web lookalike | Site token |
|---|---|---|---|
| Serif | Utopia Std, by optical cut | Newsreader | `--ff-display` and its cut variants |
| Sans | Lab Grotesque | DM Sans | `--ff-body` |
| Wide UI | Eurostile Next | Michroma | `--ff-ui` and `--ff-ui-ext` |
| Mono | IBM Plex Mono | Chivo Mono | `--ff-mono` |

Utopia Std ships one family name over four optical cuts, so a renderer asked for "Utopia Std" sets whichever cut it met first. The Text and Subhead cuts are therefore installed under their own family names, `Utopia Std Text` for running text and `Utopia Std Subhead` for titles, and a role names the cut drawn for its size.

A lecture uses the house set when Michael presents from his own Mac. On a venue machine, which has none of the house faces, it uses Georgia for the serif and Franklin Gothic Medium for the sans.

Every role names a font-stack token in an instance, never a family, so swapping a face is one change to the token.

## Values

The generator reads the one JSON block in this section. Each house cut is the family name a renderer asks for. The PostScript names a rendered document prints differ by renderer, since Typst truncates them in the PDF, so each token instance keeps its own `font.served` list for its medium.

```json
{
  "name": "Level One Radiology",
  "id": "level-one",
  "house": {
    "serif": {"text": "Utopia Std Text", "subhead": "Utopia Std Subhead"},
    "sans": {"regular": "Lab Grotesque", "medium": "Lab Grotesque Med"},
    "ui": {"regular": "Eurostile Next LT Pro", "extended": "Eurostile Next W1G Ext"},
    "mono": {"regular": "IBM Plex Mono"}
  },
  "web": {
    "serif": "--ff-display",
    "sans": "--ff-body",
    "ui": "--ff-ui",
    "mono": "--ff-mono"
  },
  "venue": {
    "serif": "Georgia",
    "sans": "Franklin Gothic Medium"
  }
}
```

The `web` entries name site tokens, and the generator reads each lookalike as the first family in that token's stack in `typography.css`.
