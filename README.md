# AI Video Generator

A comprehensive AI-powered video generation mobile app developed on Android.
This project leverages advanced AI technologies to create engaging video
content, offering users a seamless experience to generate, customize, and review
video scripts with robust content moderation features.

![Homepage](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-1/homepage.png)

<!-- Replace with actual image URL if available -->

<div align="center">
  <p align="center">
    A mobile clone app of <strong>Spotify</strong> built on Android using Java and Node.js backend.
    <br />
    <a href="https://drive.google.com/file/d/1zRXpzmPPI7xydeOQe341ZAkbJTfrPVCZ/view?usp=drive_link"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://drive.google.com/file/d/1vwkwNnwSuI_T6_1Q6ug_HKUAcVRE89-f/view?usp=sharing">View Demo</a>
    ·
    <a href="https://docs.google.com/presentation/d/1PAafdFnVqIbzCh_kr04a4PRySFD_EqOU/edit?usp=drive_link&ouid=100651601658120224541&rtpof=true&sd=true">View Presentation</a>
  </p>
</div>

## Features

- **Video Content Creation (Step 1)** The video creation process begins with a
  comprehensive content generation step, designed to provide users with flexible
  and customizable options for crafting video scripts. This step includes the
  following functionalities:

1. Content Generation:

- Input Topic: Users can enter a specific topic for the video.
- Select Content Style: Choose from various content styles (e.g., narrative,
  educational, promotional).
- Personalize Writing Style: Customize the tone of the script (e.g., formal,
  casual, creative).
- Target Audience: Select the intended audience (e.g., students, children,
  elderly) to tailor the content appropriately.
- Number of Scenes: Specify the number of scenes to be generated for the video.
- AI Model Selection: Choose between advanced AI models (Gemini or Meta AI) for
  content generation.
- File Upload Option: Alternatively, users can upload Word or PDF files to
  generate video content directly from existing documents.
  ![Content Generation](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-1/content-genrator.png)
  ![File Upload Option](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-1/file.png)

2. Sensitive Content Check (Highlighted Feature):

- A mandatory step that scans and flags sensitive or inappropriate content
  before proceeding to further steps.
- Utilizes advanced AI algorithms to detect potentially harmful material, such
  as content that could be used for misinformation, defamation, deepfake
  generation, or activities that threaten national security or social order.
- This feature ensures compliance with ethical standards, protecting user
  integrity and fostering a responsible platform for creative expression.
- In the context of rapidly evolving AI technologies, particularly generative
  models, this step addresses critical concerns about misuse, making it an
  indispensable part of the content creation process.

3. Script Editing:

- Users can manually edit the generated script to align with their creative
  vision.
  ![Script editing](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-1/edit-script.png)

4. Script Approval:

- Final review and approval of the script before moving to subsequent video
  generation steps.
  ![Script preview and approval](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-1/script-preview.png)

- **Voice Generation (Step 2)** After approving the script, users proceed to the
  voice generation step, where they can customize the audio narration for each
  scene. This step includes the following functionalities:

1. Select Speaker Voice: Choose from a variety of AI-generated voices (e.g.,
   male, female, different accents) to match the video’s tone and audience.
2. Adjust Reading Speed: Fine-tune the speed of the narration to suit the pacing
   of the video (e.g., slow for educational content, fast for promotional
   videos).
3. Select Stability: Adjust the consistency and clarity of the voice output to
   ensure high-quality audio with minimal artifacts or distortions.
4. hoose Speaking Style: Customize the speaking style (e.g., conversational,
   authoritative, enthusiastic) to align with the video’s content and target
   audience.
5. Audio Preview: After generating the audio, users can listen to the narration
   for each scene directly within the app. Previews are displayed below each
   scene, allowing easy review and adjustments before proceeding to the next
   step.
   ![Voice Generation](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-2/voice.png)

- **Image Generation (Step 3)** Once the audio narration is finalized, users
  move to the image generation step to create visuals for each scene in the
  video. This step includes the following functionalities:

1. Select Visual Style:

- Users are presented with six distinct visual styles for the entire video:
  Sketch, Classic, Modern, Abstract, Realistic, and Cartoon.
- The chosen style is applied uniformly across all scenes to ensure visual
  consistency.

      ![Select Visual Style](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-3/choose-style.png)

2. Image Generation:

- After selecting a style, the app generates images for each scene based on the
  approved script and chosen visual style.

3. Image Review and Editing:

- Generated images are displayed for user review.
- Users can regenerate or edit images by modifying the prompt for each scene,
  allowing for fine-tuned customization to match their creative vision.

  ![Preview](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-3/preview.png)

![Edit Image](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-3/edit.png)

4. Image Approval:

- Users review and approve the final set of images before proceeding to the next
  step in the video creation process.

- **Video Editing (Step 4)** After approving the images, users proceed to the
  video editing step to refine and polish the video. This step allows users to
  arrange scenes, add effects, and customize audio elements. The functionalities
  include:

1. Timeline Editing:

- Users can drag and drop to adjust the timeline of the entire video,
  rearranging scenes in their desired order for optimal storytelling flow.

  ![Timeline Editing](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-4/edit-timeline.png)

2. Effects and Audio Customization:

- Scene Transitions: Adjust in/out effects for each scene (e.g., fade, slide,
  dissolve) to enhance visual flow.
- Subtitle Customization: Automatically generate subtitles with options to
  adjust their position, font style, and size.
- Background Music: Choose from a library of pre-selected background music
  tracks, categorized by mood (e.g., upbeat, calm, dramatic), and adjust the
  volume to balance with the narration.
- Watermark Option: Users can choose whether to include a watermark on the video
  for branding or copyright purposes.

  ![Effects and Audio Customization](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-4/edit-effects.png)

3. Video Preview:

- After applying edits, the app generates a preview of the video for user
  review.
- Users can return to previous editing steps if the preview is unsatisfactory or
  approve the video to proceed to the next step.

  ![Preview](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-4/preview.png)

- **Video Publishing (Step 5)** The final step allows users to publish their
  completed video directly to their YouTube channel. This step includes the
  following functionalities:

1. YouTube Authentication:

- Users log in to their YouTube account via OAuth to securely connect the app to
  their channel.

2. Video Metadata Customization:

- Title: Users can input a title for the video.
- Description: Users can add a detailed description to provide context or
  promote the video.
- Tags: Users can add relevant tags to improve discoverability on YouTube.

3. Privacy Settings:

- Users can choose the visibility of the video: Public, Private, or Unlisted.

4. Publish to YouTube:

- After configuring the metadata and privacy settings, users can easily publish
  the video to their YouTube channel directly from the app.

  ![Video Publishing ](https://github.com/nlanhduy/ai-video-generator/blob/3352ddf5ca0d203377418fb1b7efc4a77cea4f65/public/img/step-5/publish.png)

- **Search and Discovery**

  - Search by song, album, artist, genre
  - Smart suggestions, pagination, and filters
  - Album, artist, and genre detail pages
  - New releases and music charts

- **Notifications**

  - Firebase Cloud Messaging
  - Music and system alerts
  - Token management for user-specific push notifications

- **Chatbot & Utility Features**
  - Chatbot with AI-based song suggestions
  - Sleep timer for automatic playback stop

## Technology Stack

### Client (Android App)

- **Language**: Java
- **Architecture**: MVVM
- **IDE**: Android Studio
- **Notifications**: Firebase Cloud Messaging
- **API Communication**: REST via Retrofit
- **Offline Mode**: Local storage and media caching

### Server (Backend)

- **Platform**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access & Refresh Tokens)
- **Architecture**: Three-Tier (Controller - Service - Model)
- **Media Storage**: Cloudinary
- **Testing**: Postman for API validation

### Tools & Integrations

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=androidstudio,java,nodejs,express,mongodb,firebase,postman,cloudinary" />
  </a>
</p>

## Project Structure

This project is divided into two main repositories:

- 📱 **Client App (Android)**  
  Handles the UI/UX, playback, user interaction, and connection with backend
  services.

- 🔗 **Server API**  
  Provides authentication, content management, media handling, and user data
  processing.

## Purpose

This project was created as a final assignment for a mobile development course.
It serves as a practical exercise in building a full-featured, scalable music
streaming app with real-world architecture and technologies, inspired by
Spotify's success model.

---

> 📂 Repositories:
>
> - Server: [https://github.com/anhhuy007/spotify-server]

Feel free to explore, contribute, or fork the project!
