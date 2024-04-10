#!/bin/bash

# Check if at least one directory argument was provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <directory> [overwrite]"
    exit 1
fi

# Assign the first argument to a variable
root_dir=$1
overwrite=$2 # This argument controls file overwriting: use "yes" to overwrite

# Ensure the provided directory exists
if [ ! -d "$root_dir" ]; then
    echo "Directory does not exist: $root_dir"
    exit 1
fi

dir="$root_dir"
max_size=720    

# todo: handle other video files
for video_file in "$root_dir"*.mp4; do
  # Continue if no .mov files are found
  [ -e "$video_file" ] || continue

    # Define output file names for each format
    filename=$(basename -- "$video_file")
    base_output_file="${root_dir}web/${filename%.mp4}"
    output_mp4="${base_output_file}.mp4"
    output_hevc="${base_output_file}_hevc.mp4"
    output_vp9="${base_output_file}.webm"
    output_thumb="${base_output_file}-thumb.webp" 

    # Function to check file existence and overwrite flag
    check_and_convert() {
      local output=$1
      shift
      if [ -f "$output" ] && [ "$overwrite" != "yes" ]; then
        echo "Skipping $output: File exists. Use overwrite=yes to force conversion."
        return
      fi
      echo "Converting $video_file to $output"
      ffmpeg "$@"
    }

    # H.264 (AVC) Conversion
    check_and_convert "$output_mp4" -y -i "$video_file" \
      -vf "scale='if(gt(iw/ih,1),-1,$max_size)':'if(gt(iw/ih,1),$max_size,-1)',crop=$max_size:$max_size" \
      -c:v libx264 -profile:v high -crf 32 -preset slow -sc_threshold 0 -g 48 -keyint_min 48 \
      -b:v 3000k -maxrate 3500k -bufsize 5000k \
      $(ffprobe -i "$video_file" -show_streams -select_streams a -loglevel error | grep -q codec_type=audio && echo "-c:a aac -ar 48000 -b:a 192k" || echo "-an") \
      -movflags +faststart "$output_mp4"

    # H.265 (HEVC) Conversion
    # check_and_convert "$output_hevc" -y -i "$mov_file" \
    # -vf "scale='if(gt(iw/ih,1),-1,$max_size)':'if(gt(iw/ih,1),$max_size,-1)',crop=$max_size:$max_size" \
    # -c:v libx265 -crf 24 -preset slow \
    # $(ffprobe -i "$mov_file" -show_streams -select_streams a -loglevel error | grep -q codec_type=audio && echo "-c:a aac -ar 48000 -b:a 192k" || echo "-an") \
    # "$output_hevc"

    # VP9 Conversion
    check_and_convert "$output_vp9" -y -i "$video_file" \
      -vf "scale='if(gt(iw/ih,1),-1,$max_size)':'if(gt(iw/ih,1),$max_size,-1)',crop=$max_size:$max_size" \
      -c:v libvpx-vp9 -crf 42 -b:v 0 -preset slow \
      $(ffprobe -i "$video_file" -show_streams -select_streams a -loglevel error | grep -q codec_type=audio && echo "-c:a libopus -b:a 128k" || echo "-an") \
      "$output_vp9"

    ffmpeg -i "$video_file" -y -vf "select=eq(n\,0)" -q:v 3 "$output_thumb"
  done

echo "Conversion complete."
