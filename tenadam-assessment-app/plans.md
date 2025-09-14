# Plan for Tenadam Assessment App

## Phase 1: Fix Progress Saving and Loading (Completed)
-   **Issue:** Frontend `saveProgress` was calling a non-existent backend endpoint, leading to errors.
-   **Solution:**
    -   Added `UserProgress` model to `prisma/schema.prisma`.
    -   Ran `npx prisma db push` to update the database schema.
    -   Corrected API URLs in `frontend/src/lib/assessment.ts` for `getUserProgress` and `saveProgress`.
    -   Implemented `POST /api/assessment/progress/:userId` endpoint in `backend/src/routes/assessment.ts` to save user progress using `prisma.userProgress.upsert`.
    -   Modified `GET /api/assessment/progress/:userId` endpoint in `backend/src/routes/assessment.ts` to retrieve user progress from the `UserProgress` model.
-   **Status:** Completed. User confirmed progress saving is working.

## Phase 2: Integrate Questions from PDF

### Goal
Extract assessment categories, subcategories, and questions from `2021-2022 _Baldrige_Excellence_Framework_Business_Nonprofit.pdf` and integrate them into the application.

### Steps

1.  **Read and Parse PDF:**
    -   Read the content of `2021-2022 _Baldrige_Excellence_Framework_Business_Nonprofit.pdf`.
    -   Develop a parsing logic (likely in a new script or a utility function) to extract structured data (categories, subcategories, questions, item codes, text) from the PDF's text content. This will involve identifying patterns in the document.

2.  **Prepare Data for Seeding:**
    -   Transform the extracted data into a format compatible with the existing `Category`, `Subcategory`, and `Question` models in the Prisma schema.
    -   Ensure unique IDs are generated for each category, subcategory, and question.

3.  **Update `prisma/seed.ts`:**
    -   Modify `prisma/seed.ts` to use the parsed data to populate the database. This will involve deleting existing assessment data and inserting the new data from the PDF.

4.  **Run Seeder:**
    -   Execute the seeding script (`npx prisma db seed`) to populate the database with the new questions.

5.  **Verify Integration:**
    -   Confirm that the frontend correctly displays the new categories, subcategories, and questions from the PDF.
    -   Ensure that the assessment flow, progress tracking, and response saving mechanisms work correctly with the new data.

### Dependencies
-   Access to the PDF file: `2021-2022 _Baldrige_Excellence_Framework_Business_Nonprofit.pdf`.
-   Prisma ORM for database interaction.

### Open Questions / Challenges
-   **PDF Parsing Complexity:** The PDF might have complex formatting (tables, multi-column layouts, images) that could make text extraction and structuring challenging. I will need to analyze the PDF content carefully.
-   **Mapping to Schema:** Ensuring the extracted data accurately maps to the existing `Category`, `Subcategory`, and `Question` models (e.g., `displayOrder`, `questionType`, `required` fields).
-   **Handling Existing Data:** The seeding process will likely overwrite existing assessment data. This needs to be clearly communicated and handled.
