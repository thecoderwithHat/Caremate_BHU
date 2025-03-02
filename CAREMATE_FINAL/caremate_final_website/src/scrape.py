import os
import re
import requests

# Directory to search files in
search_directory = './components'  # Change this to your target directory
# Directory to save images
save_directory = '../public/images'

# Ensure the save directory exists
os.makedirs(save_directory, exist_ok=True)

# Regular expression to match the specific URL pattern
url_pattern = re.compile(r'https://prohealth-react\.vercel\.app/images/.*\.[\w]+')

# Loop through all files in the directory
for root, dirs, files in os.walk(search_directory):
    for file_name in files:
        file_path = os.path.join(root, file_name)

        # Open and read each file
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()

            # Find all matching URLs in the content
            urls = url_pattern.findall(content)

            # Download each image
            for url in urls:
                image_name = url.split('images/')[-1]  # Extract image filename from URL
                image_path = os.path.join(save_directory, image_name)

                # Download the image
                try:
                    response = requests.get(url, stream=True)
                    response.raise_for_status()
                    with open(image_path, 'wb') as img_file:
                        for chunk in response.iter_content(1024):
                            img_file.write(chunk)
                    print(f'Downloaded: {url} to {image_path}')
                except requests.exceptions.RequestException as e:
                    print(f'Failed to download {url}: {e}')
