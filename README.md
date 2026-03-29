# Graphics Lab Simulator

An interactive browser-based computer graphics simulator for visualizing classic rasterization, transformation, clipping, filling, and hidden-surface algorithms on a Cartesian canvas.

## Overview

This project is a front-end-only graphics simulator built with:

- `HTML`
- `CSS`
- `JavaScript`

It runs in the browser and lets the user experiment with common computer graphics algorithms using direct inputs and canvas interaction.

## Algorithms Simulated

### Basic Rasterization

- `DDA Line Drawing Algorithm`
- `Bresenham Line Drawing Algorithm`
- `Midpoint Circle Drawing Algorithm`

### Basic 2D Transformations

- `Translation`
- `Scaling`
- `Rotation`
- `Shearing`
- `Reflection`

### Clipping Algorithms

- `Cohen-Sutherland Line Clipping Algorithm`
- `Sutherland-Hodgman Polygon Clipping Algorithm`

### Polygon Filling Algorithms

- `Scan-Line Fill`
- `Boundary Fill`
- `Flood Fill`

### Hidden Surface Detection Algorithms

- `Back-Face Culling`
- `Painter's Algorithm`
- `Z-Buffer Algorithm`

## How the Inputs Work

The simulator uses a Cartesian coordinate system:

- origin `(0,0)` is at the center of the canvas
- positive `X` goes to the right
- positive `Y` goes upward

The `Category` dropdown chooses the feature group, and the `Algorithm` dropdown chooses the specific algorithm inside that group.

### 1. Basic Rasterization Inputs

Used for:

- `DDA`
- `Bresenham`
- `Midpoint Circle`

Inputs:

- `x1`, `y1`, `x2`, `y2`

Meaning:

- for line algorithms:
  - `(x1, y1)` = starting point
  - `(x2, y2)` = ending point
- for midpoint circle:
  - `(x1, y1)` = center
  - `x2` = radius

Output:

- the selected line or circle is drawn directly on the canvas

### 2. Basic 2D Transformation Inputs

Used for:

- `Translation`
- `Scaling`
- `Rotation`
- `Shearing`
- `Reflection`

Inputs:

- create the object by clicking on the canvas to add vertices
- press `Close Object` after placing the vertices
- transformation fields:
  - `Translate X`, `Translate Y`
  - `Scale X`, `Scale Y`
  - `Angle`
  - `Shear X`, `Shear Y`
  - `Pivot X`, `Pivot Y`
  - `Reflection` mode

Meaning:

- you first define a polygonal 2D object
- then you apply one selected transformation to that object
- the pivot values are used for scaling, rotation, and shearing

Output:

- gray object = original object
- blue object = transformed result

### 3. Clipping Algorithm Inputs

Used for:

- `Cohen-Sutherland Line Clipping`
- `Sutherland-Hodgman Polygon Clipping`

Inputs:

- clipping window:
  - `xMin`, `yMin`, `xMax`, `yMax`
- line clipping:
  - `x1`, `y1`, `x2`, `y2`
- polygon clipping:
  - click on the canvas to add polygon vertices
  - press `Close Polygon`

Meaning:

- the clipping window is the rectangular area that should remain visible
- anything outside that window is rejected or trimmed

Output:

- black rectangle = clipping window
- gray shape = original line or polygon
- blue shape = clipped visible result inside the window

### 4. Polygon Filling Inputs

Used for:

- `Scan-Line Fill`
- `Boundary Fill`
- `Flood Fill`

Inputs:

- click on the canvas to create polygon vertices
- press `Close Polygon`
- optionally click inside the polygon to set a seed point
- choose:
  - `Fill` color
  - `Boundary` color

Meaning:

- `Scan-Line Fill` fills the inside of a closed polygon
- `Boundary Fill` spreads from the seed point until it reaches the boundary color
- `Flood Fill` spreads from the seed point through connected pixels of the same target color

Output:

- the polygon is shown on the canvas
- the interior is filled according to the selected algorithm
- filling can be animated using `Run`, `Step`, and the speed slider

### 5. Hidden Surface Detection Inputs

Used for:

- `Back-Face Culling`
- `Painter's Algorithm`
- `Z-Buffer Algorithm`

Inputs:

- object selection:
  - `Cube`
  - `Pyramid`
- `Scale`
- rotation sliders:
  - `X`
  - `Y`
  - `Z`

Meaning:

- the app builds a 3D object
- rotates it in space
- projects it onto the 2D canvas
- then applies the selected visibility method

Output:

- a 3D object rendered on the canvas
- only the visible surfaces are shown according to the chosen algorithm

## How the Outputs Should Be Read

In most modes, the result appears directly on the canvas.

Typical output meanings:

- grid and axes help show position in Cartesian coordinates
- gray often indicates the original object or shape
- blue often indicates the transformed or clipped result
- status text explains what operation was performed
- step count is mainly useful for fill visualization

## Main Controls

- `Run`: executes the selected algorithm
- `Step`: advances fill visualization step by step
- `Clear`: clears the canvas while preserving some mode-specific state
- `Speed`: controls fill animation speed
- `Grid`: shows or hides the background coordinate grid

## How to Run

Open the simulator with a local server from the `Simulator` folder:

```bash
cd graphics_lab/Simulator
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

On Windows PowerShell, if `python3` is not available, use:

```powershell
py -m http.server 8000
```

## Project Files

- `graphics_lab/Simulator/index.html` - UI structure
- `graphics_lab/Simulator/style.css` - UI styling
- `graphics_lab/Simulator/script.js` - algorithm logic and canvas interaction
- `PROJECT_SUMMARY.md` - detailed internal project summary
