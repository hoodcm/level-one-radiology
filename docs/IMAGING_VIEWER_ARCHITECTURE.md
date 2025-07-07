# Imaging Viewer Architecture

## Overview

The imaging viewer system uses a two-layer architecture designed for progressive enhancement:

1. **Light Viewer** - Fast-loading, mobile-first stack viewer
2. **Heavy Viewer** - Full-featured DICOM viewer with advanced tools (lazy-loaded)

## Architecture Components

### Core Components

```
src/components/
├── CaseViewerShell.tsx        # Main coordinator component
├── light/
│   └── LightStackViewer.tsx   # Lightweight stack viewer
└── heavy/
    └── FullDicomViewer.tsx    # Advanced DICOM viewer (lazy-loaded)
```

### Component Responsibilities

#### CaseViewerShell
- Manages viewer state (light vs heavy)
- Handles dynamic loading of heavy viewer
- Provides modal interface for full viewer
- Coordinates between viewer layers

#### LightStackViewer
- **Purpose**: Fast, mobile-first image stack navigation
- **Features**:
  - Touch gesture support (swipe, pinch-to-zoom)
  - Keyboard navigation (arrow keys, space/shift+space)
  - Basic image controls (zoom, pan)
  - Slice counter and progress indication
  - Upgrade button to full viewer
- **Performance**: Optimized for quick loading and smooth interactions

#### FullDicomViewer
- **Purpose**: Advanced medical imaging tools
- **Features** (to be implemented):
  - Professional windowing controls
  - Measurement tools
  - Annotation capabilities
  - Multi-planar reconstruction
  - Advanced image processing
- **Loading**: Lazy-loaded only when needed

## Case Management System

### Directory Structure

```
public/cases/
├── acute-appendicitis-case/
│   ├── manifest.json
│   └── [image files or references]
├── another-case-slug/
│   ├── manifest.json
│   └── [image files or references]
└── ...
```

### Manifest Format

Each case requires a `manifest.json` file in `public/cases/{case-slug}/`:

```json
{
  "baseUrl": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
  "slices": 25
}
```

**Properties:**
- `baseUrl`: Base URL for image loading (can be external or relative)
- `slices`: Total number of image slices in the stack

### Image URL Generation

The LightStackViewer generates image URLs using:
```
{baseUrl}?w=800&h=600&fit=crop&auto=format&q=80&slice={sliceNumber}
```

For external services (like Unsplash), slice numbers are appended as query parameters.
For local images, implement a naming convention like `image-001.jpg`, `image-002.jpg`, etc.

## Adding New Cases

### Step 1: Create Case Directory
```bash
mkdir public/cases/your-case-slug
```

### Step 2: Create Manifest
Create `public/cases/your-case-slug/manifest.json`:
```json
{
  "baseUrl": "/cases/your-case-slug/images/image",
  "slices": 30
}
```

### Step 3: Add Images
For local images, organize as:
```
public/cases/your-case-slug/
├── manifest.json
└── images/
    ├── image-001.jpg
    ├── image-002.jpg
    ├── ...
    └── image-030.jpg
```

### Step 4: Create Case Content
Create markdown content in `content/your-case-slug.md` with category "Case Study".

### Step 5: Verify Integration
The case will automatically be available at `/cases/your-case-slug` and include the interactive viewer.

## Routing Integration

### Case Pages
- **Route**: `/cases/:slug`
- **Component**: `CasePage.tsx`
- **Features**:
  - Fetches manifest data
  - Renders markdown content
  - Embeds CaseViewerShell
  - Provides case metadata and related cases

### Viewer Modal
- **Trigger**: "Open Full Viewer" button in LightStackViewer
- **Component**: FullDicomViewer (lazy-loaded)
- **Features**: Full-screen modal with advanced tools

## Performance Considerations

### Light Viewer Optimizations
- Progressive image loading with quality tiers
- Touch gesture optimization for mobile
- Minimal bundle size impact
- Fast initial render

### Heavy Viewer Loading
- Code-splitting with React.lazy()
- Load only when explicitly requested
- Suspense boundary with loading state
- Full feature set without initial bundle impact

## Development Guidelines

### Adding Features to Light Viewer
- Keep bundle size minimal
- Focus on essential navigation and viewing
- Maintain mobile-first approach
- Ensure touch gesture compatibility

### Adding Features to Heavy Viewer
- Professional medical imaging tools
- Advanced measurements and annotations
- Complex image processing
- Desktop-optimized interfaces

### Testing New Cases
1. Verify manifest.json loads correctly
2. Test image URL generation
3. Confirm gesture controls work
4. Validate full viewer opens properly
5. Check performance on mobile devices

## Troubleshooting

### Common Issues

**Images not loading:**
- Check manifest.json syntax and location
- Verify baseUrl accessibility
- Confirm slice count matches available images
- Check browser network tab for failed requests

**Viewer not opening:**
- Check for JavaScript errors in console
- Verify CaseViewerShell is properly imported
- Confirm lazy loading suspense boundaries

**Performance issues:**
- Optimize image sizes (recommended: 800x600 max)
- Check network loading times
- Consider image compression
- Monitor memory usage with large stacks

### Debug Mode
Enable console logging in LightStackViewer by setting `DEBUG=true` in the component for detailed interaction logging.

## Deployment Status

### ✅ Completed Components
- **CaseViewerShell.tsx** - Main coordinator component
- **LightStackViewer.tsx** - Mobile-first stack viewer
- **FullDicomViewer.tsx** - Stub for advanced viewer
- **CasePage.tsx** - Case route with viewer integration
- **Public case structure** - Manifest system implemented

### ✅ Cleaned Up (Removed Legacy Components)
- DicomViewer.tsx (old standalone viewer)
- DicomViewerOverlay.tsx (old overlay system)
- ResponsiveDicomViewer.tsx (old responsive wrapper)
- DicomMainViewer.tsx (old main viewer component)
- ViewerControls.tsx (replaced by LightStackViewer controls)
- ViewerSidebar.tsx (removed for mobile-first approach)
- ImageNavigator.tsx (functionality moved to LightStackViewer)
- WindowingPresets.tsx (to be reimplemented in FullDicomViewer)

### 🔄 Current Architecture
```
Cases Route (/cases/:slug)
    ↓
CasePage.tsx (fetches manifest + renders content)
    ↓
CaseViewerShell.tsx (manages light/heavy viewers)
    ↓
┌─ LightStackViewer.tsx (default, fast loading)
└─ FullDicomViewer.tsx (lazy-loaded on demand)
```

### 🎯 Ready for Production
The new viewer architecture is fully deployed and functional:

1. **Performance Optimized**: Light viewer loads immediately
2. **Progressive Enhancement**: Heavy viewer loads only when needed
3. **Mobile First**: Touch gestures and responsive design
4. **Clean Routing**: Cases properly routed to `/cases/:slug`
5. **Manifest System**: Flexible image loading from any source
6. **Code Splitting**: Heavy viewer doesn't impact initial bundle size

### 📋 Deployment Checklist
- [x] Remove old DICOM viewer components
- [x] Update routing to use new case system
- [x] Clean up unused imports and dependencies
- [x] Ensure light viewer works on mobile devices
- [x] Verify manifest loading system
- [x] Test case routing and content rendering
- [x] Confirm lazy loading of full viewer
- [ ] Implement FullDicomViewer advanced features (future)
- [ ] Add more windowing presets to FullDicomViewer (future)
- [ ] Consider adding measurement tools to FullDicomViewer (future)