# Graphics Lab Project Summary

## Overview

This project currently contains a single browser-based simulator located in `graphics_lab/Simulator/`. It is a front-end only Computer Graphics Algorithm Simulator built with plain HTML, CSS, and JavaScript. There is no backend, build system, package manager setup, or module structure in the current repository.

The simulator is designed to demonstrate three groups of graphics topics:

1. Basic rasterization
2. Polygon filling
3. Hidden surface detection

The application uses a single HTML page, a single CSS stylesheet, and a single JavaScript file that contains all UI logic, drawing logic, animation handling, and algorithm implementations.

## Current File Structure

`graphics_lab/Simulator/index.html`

- Defines the full simulator UI.
- Includes controls for category selection, algorithm selection, speed, grid toggle, run, step, and clear.
- Includes separate input panels for:
  - basic rasterization inputs
  - polygon filling inputs
  - hidden surface inputs
- Provides a single canvas for rendering.
- Shows status text and step counter.

`graphics_lab/Simulator/style.css`

- Styles the page with a centered white container on a gradient background.
- Provides layout for the top control bar, input panels, blocks, status area, and canvas.
- Uses simple responsive flex layouts.
- Keeps only the currently active panel visible using the `.active` class.

`graphics_lab/Simulator/script.js`

- Contains all application logic.
- Handles coordinate conversion between world space and canvas space.
- Implements drawing and filling algorithms.
- Implements simple 3D object construction, rotation, projection, and hidden-surface rendering modes.
- Manages UI events, state, animation speed, and step-by-step queue playback.

## What Has Been Implemented

### 1. Canvas and Coordinate System

The simulator uses a fixed canvas of `700 x 560`.

The origin is placed at the center of the canvas instead of the top-left corner. The code converts between:

- world coordinates: mathematical Cartesian system
- canvas coordinates: browser pixel system

This allows users to work with graphics-style coordinates where:

- positive X goes right
- positive Y goes up

Implemented helpers:

- `toCanvasX`, `toCanvasY`
- `toWorldX`, `toWorldY`
- `plot`

This is an important foundation because all algorithms use the centered Cartesian interpretation.

### 2. Grid and Axes Rendering

The simulator can display or hide a background grid.

When grid mode is enabled:

- light grid lines are drawn every 50 units
- the X-axis and Y-axis are drawn in darker black

This is handled by `drawGrid()`, which also clears the canvas before redrawing.

### 3. Basic Rasterization Algorithms

The project currently includes three basic drawing algorithms:

#### DDA Line Drawing

Implemented in `drawDDA(x1, y1, x2, y2, color)`.

What it does:

- computes `dx`, `dy`
- chooses the number of steps using the larger delta
- increments X and Y gradually
- rounds the coordinates and plots pixels

This gives a standard Digital Differential Analyzer line implementation.

#### Bresenham Line Drawing

Implemented in `drawBresenham(x1, y1, x2, y2, color)`.

What it does:

- uses integer-style error tracking
- updates the current point until the end point is reached
- supports lines in different directions by using `sx` and `sy`

This is a more efficient raster line approach than DDA and is also reused for polygon edge drawing.

#### Midpoint Circle Drawing

Implemented in `drawCircle(xc, yc, r, color)`.

What it does:

- starts from the top of the circle
- uses the midpoint decision variable
- plots all eight symmetric points for each step

This is a standard midpoint circle implementation using symmetry.

### 4. Polygon Filling Features

The filling section is interactive and is more developed than the basic section in terms of visualization flow.

Users can:

- click on the canvas to add polygon vertices
- close the polygon
- undo the last vertex
- reset the polygon
- choose fill and boundary colors
- click to set a seed point after the polygon is closed

State for this mode is stored in `fillState`, which tracks:

- `vertices`
- `closed`
- `seed`

The UI also updates two text displays:

- polygon info
- seed info

Implemented helper functions include:

- `updatePolyInfo()`
- `updateSeedInfo()`
- `drawPolygonOutline()`
- `polygonYBounds()`
- `hexToRGBA()`
- `sameRGBA()`
- `getPixelRGBA()`
- `setPixelRGBA()`

### 5. Scan-Line Fill

Implemented in `buildScanlineQueue(vertices, fillHex)`.

What it does:

- computes the polygon Y-range
- scans line by line from `ymin` to `ymax`
- finds edge intersections for each scanline
- ignores horizontal edges during intersection counting
- sorts intersections
- fills between intersection pairs

Important implementation detail:

- this does not fill immediately
- it builds a queue of pixel operations for visualization

That queue is later animated using the step engine.

### 6. Boundary Fill

Implemented in `buildBoundaryFillQueue(seed, boundaryHex, fillHex)`.

What it does:

- reads current canvas image data
- checks the seed pixel
- performs stack-based region traversal
- stops at boundary color
- avoids revisiting pixels using a `Set`
- stores fill operations in a queue

Important behavior:

- the polygon outline is expected to already be drawn in the boundary color
- the algorithm uses current canvas pixels, not geometric polygon math

### 7. Flood Fill

Implemented in `buildFloodFillQueue(seed, targetHex, fillHex)`.

What it does:

- reads the color at the seed position
- treats that as the target region color
- performs stack-based traversal
- replaces only matching target-color pixels

Important behavior:

- the current implementation automatically uses the seed pixel's existing color as the target color
- there is no separate user input for target color

### 8. Step-by-Step Fill Visualization

The project contains a queue-based animation system stored in the `animation` object.

Tracked fields:

- `running`
- `timer`
- `fps`
- `step`
- `queue`

Implemented functions:

- `runQueuePixelOps(imgDataOpt)`
- `doOneStep(imgDataOpt)`
- `setStep()`
- `stopAnimation()`
- `syncSpeed()`

How it works:

- fill algorithms prepare a queue of pixel operations
- `Run` animates the queue over time
- `Step` processes part of the queue manually
- the speed slider controls animation frame rate

Current design focus:

- step-by-step visualization is mainly intended for polygon filling modes
- basic rasterization and hidden-surface modes render directly instead of using the queue

### 9. Hidden Surface Detection Section

The third category demonstrates basic 3D visibility concepts.

The UI supports:

- object type selection
- cube or pyramid
- scale input
- X, Y, Z rotation sliders

Rotation labels are updated live, and changing rotation in hidden mode re-renders automatically.

### 10. 3D Data and Math Utilities

Implemented math and geometry helpers:

- `degToRad()`
- `rotXYZ()`
- `sub3()`
- `cross()`
- `dot()`
- `projectOrtho()`
- `triangulateFace()`

Implemented object generators:

- `makeCube(scale)`
- `makePyramid(scale)`

Implemented scene builder:

- `build3DScene()`

What this section currently does:

- creates hard-coded object vertices and faces
- rotates vertices around X, Y, and Z axes
- computes face normals
- computes average Z depth per face
- projects 3D points orthographically into 2D canvas coordinates

### 11. Back-Face Culling

Implemented in `renderBackFaceCulling(polys)`.

What it does:

- uses a fixed view direction
- checks face visibility using the face normal and dot product
- renders only faces judged to face the camera
- fills visible polygons and strokes outlines

This provides a simple demonstration of surface removal by culling hidden faces before drawing.

### 12. Painter's Algorithm

Implemented in `renderPainter(polys)`.

What it does:

- sorts polygons by average Z value
- draws polygons from far to near

This demonstrates visibility resolution by draw order rather than per-pixel testing.

### 13. Z-Buffer Algorithm

Implemented in `renderZBuffer(polys)`.

What it does:

- triangulates each polygonal face
- rasterizes triangles using barycentric coordinates
- interpolates Z values
- keeps a depth buffer for per-pixel visibility
- writes only the nearest visible color into the image buffer

This is the most advanced rendering method in the current codebase and demonstrates true per-pixel hidden-surface resolution.

## UI and Interaction Flow

### Category Switching

When the user changes the category:

- the algorithm dropdown is rebuilt
- the correct panel is shown
- the canvas is reset
- status text is updated

For hidden-surface mode, a render is triggered immediately after switching.

### Run Button

`Run` performs different actions depending on category:

- basic: validates numeric input and draws immediately
- fill: prepares a queue and starts animation
- hidden: builds the 3D scene and renders immediately

### Step Button

`Step` is currently meaningful only for fill-mode visualizations.

If used outside fill mode, the app shows a status message saying step mode is designed for polygon filling.

### Clear Button

`Clear` wipes the canvas but preserves current fill-mode state.

That means:

- polygon vertices remain in memory
- polygon outline can be redrawn
- seed point is preserved

### Canvas Click Behavior

In fill mode:

- if the polygon is not closed, clicking adds vertices
- if the polygon is closed, clicking sets the seed point

This makes the canvas itself part of the input workflow.

## Easy Explanation of All Algorithms

This section explains each implemented algorithm in simple terms.

### Basic Rasterization

`DDA Line Drawing Algorithm`

- Draws a line by moving from the start point to the end point in small equal steps.
- At each step, it calculates the next X and Y position and plots the nearest pixel.
- Easy to understand, but not as efficient as Bresenham.

`Bresenham Line Drawing Algorithm`

- Draws a line using integer error checking instead of repeated floating-point calculations.
- Decides when to move in X only or in both X and Y so the line stays close to the ideal line.
- Faster and more efficient for raster displays.

`Midpoint Circle Drawing Algorithm`

- Draws a circle by checking which pixel is closer to the true circular path.
- Uses symmetry, so when it finds one point it can draw seven more matching points.
- Efficient because it avoids expensive circle calculations for every pixel.

### Basic 2D Transformations

`Translation`

- Moves the whole object from one position to another.
- The shape and size do not change, only the location changes.

`Scaling`

- Makes the object larger or smaller.
- If X and Y scale values are different, the object can stretch unevenly.

`Rotation`

- Turns the object around a pivot point by a chosen angle.
- The shape stays the same, but its orientation changes.

`Shearing`

- Slants the object sideways or upward.
- The shape becomes tilted, as if pushed in one direction.

`Reflection`

- Flips the object across a chosen axis or line.
- It creates a mirror-image version of the original object.

### Clipping Algorithms

`Cohen-Sutherland Line Clipping Algorithm`

- Checks whether parts of a line are inside or outside a rectangular clipping window.
- If only part of the line is inside, it trims the outside part and keeps the visible segment.
- If the whole line is outside, it rejects the line.

`Sutherland-Hodgman Polygon Clipping Algorithm`

- Clips a polygon against the four sides of a rectangular clipping window.
- It processes one boundary at a time and builds a new polygon from the visible parts.
- The final result is the portion of the polygon that remains inside the window.

### Polygon Filling Algorithms

`Scan-Line Fill`

- Fills a polygon row by row.
- For each horizontal line, it finds where the polygon edges are crossed and fills between those crossings.
- Works well for solid polygon filling.

`Boundary Fill`

- Starts from a seed point inside a region.
- Keeps spreading outward until it reaches the boundary color.
- Useful when the border of the shape is already clearly drawn.

`Flood Fill`

- Starts from a seed point and replaces connected pixels of the same target color.
- It keeps filling neighboring pixels until the connected area ends.
- Similar to the paint bucket tool in drawing software.

### Hidden Surface Detection

`Back-Face Culling`

- Removes surfaces that face away from the camera.
- If a face points in the opposite direction, it is not drawn.
- This reduces unnecessary drawing work.

`Painter's Algorithm`

- Draws far objects first and near objects later.
- Nearer surfaces cover the farther ones, similar to painting layers from back to front.
- Simple to understand, but can fail in some overlapping cases.

`Z-Buffer Algorithm`

- Checks depth for every pixel on the screen.
- If a new pixel is closer than the one already stored, it replaces it.
- This gives more accurate hidden-surface removal than Painter's Algorithm.

## Current Strengths

- Clear separation of features by category in the UI
- Working implementations of several classic computer graphics algorithms
- Cartesian coordinate handling centered on the canvas
- Interactive polygon creation for fill algorithms
- Step-by-step queue-based visualization for fill operations
- Multiple hidden-surface methods included in one tool
- No external dependencies, so the simulator is easy to run locally

## Current Limitations and Gaps

These are not necessarily bugs, but they are important to understand from the current code.

### 1. Project Structure Is Monolithic

All logic is in one `script.js` file. There is no modular separation for:

- UI
- raster algorithms
- fill algorithms
- 3D math
- rendering
- state management

This makes the project easy to run, but harder to maintain as it grows.

### 2. Step Mode Is Not Fully General

The step engine is mainly built for fill visualization.

- basic drawing algorithms do not expose per-step visualization
- hidden-surface algorithms render in a single pass
- step behavior for image-data-based fill modes is handled in a simplified way

### 3. No Persistence

There is no save/load support for:

- polygons
- settings
- object configuration
- previous drawings

Reloading the page resets the app.

### 4. No Formal Error Panel or Validation UI

The app uses `alert()` for invalid input and status text for general feedback. There is no richer validation or inline error display.

### 5. 3D Rendering Is Educational, Not Full Engine Logic

The hidden-surface section is intended for demonstration:

- projection is orthographic only
- object list is limited to cube and pyramid
- no camera movement system
- no lighting or shading model
- no mesh import support

### 6. No Test Suite or Documentation in Repo

At the moment there are no:

- README files
- usage docs
- code comments explaining overall architecture
- automated tests

The source is understandable, but knowledge currently lives mainly in the code itself.

## Practical Summary

At this stage, the project is a functional educational simulator for classic computer graphics topics. The implemented work is enough to demonstrate:

- line drawing
- circle drawing
- basic 2D transformations
- clipping algorithms
- polygon filling
- back-face culling
- painter-style visibility ordering
- z-buffer depth testing

The simulator already supports real interaction through the canvas and includes a basic animation system for fill algorithm visualization. The codebase is compact and functional, but still organized as a single-page prototype rather than a larger structured application.

## Syllabus Checklist: Done vs Not Done

Based on the current source code, the following status matches the project as it exists now.

### Done

- `DDA Line Drawing Algorithm`
- `Bresenham Line Drawing Algorithm`
- `Midpoint Circle Drawing Algorithm`
- `Translation`
- `Scaling`
- `Rotation` for a given 2D object
- `Shearing`
- `Reflection`
- `Cohen-Sutherland Line Clipping Algorithm`
- `Sutherland-Hodgman Polygon Clipping Algorithm`
- `Boundary Fill Algorithm`
- `Flood Fill Algorithm`
- `Back-Face Culling`
- `Z-Buffer Algorithm`
- `Painter's Algorithm`

### Also Present but Not Explicitly Listed in Your Syllabus List

- `Scan-Line Fill`

### Important Clarification

The simulator now includes a separate 2D transformation mode where users can draw a polygonal 2D object on the canvas and apply translation, scaling, rotation, shearing, and reflection. It also includes a clipping mode with a user-defined rectangular clipping window for line and polygon clipping. The hidden-surface section still contains separate 3D rotation controls for cube and pyramid visualization.

## Suggested Next Logical Improvements

If development continues, the most natural next steps would be:

1. Add a `README.md` with usage instructions and algorithm list.
2. Split `script.js` into separate modules by topic.
3. Add per-step visualization for basic rasterization algorithms.
4. Add more 3D objects and possibly perspective projection.
5. Add labels, legends, or pixel highlights to make algorithm learning clearer.
6. Add test coverage for core geometry and fill logic.
