#!/usr/bin/env python3
"""
Download parallel corpus data from OPUS for GRIOT translator
"""

import os
import subprocess
from pathlib import Path

# Create data directories
DATA_DIR = Path("training_data")
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# Language pairs to download (English to each target language)
LANGUAGE_PAIRS = [
    ('en', 'sw', 'Swahili'),
    ('en', 'yo', 'Yoruba'),
    ('en', 'ha', 'Hausa'),
    ('en', 'ig', 'Igbo'),
    ('en', 'zu', 'Zulu'),
    ('en', 'xh', 'Xhosa'),
    ('en', 'af', 'Afrikaans'),
    ('en', 'am', 'Amharic'),
    ('en', 'so', 'Somali'),
    ('en', 'rw', 'Kinyarwanda'),
    ('en', 'fr', 'French'),
    ('en', 'ar', 'Arabic'),
    ('en', 'pt', 'Portuguese'),
]

# OPUS corpora to download (in priority order)
CORPORA = [
    'JW300',          # Best for African languages
    'OpenSubtitles',  # Conversational language
    'GNOME',          # Software UI
    'Ubuntu',         # Software UI
    'Tatoeba',        # User-contributed
]

def download_corpus(source_lang, target_lang, corpus_name, lang_name):
    """Download a single corpus for a language pair"""
    
    print(f"\n{'='*60}")
    print(f"Downloading {corpus_name} for {lang_name} ({source_lang}-{target_lang})")
    print(f"{'='*60}")
    
    output_dir = RAW_DIR / f"{source_lang}-{target_lang}" / corpus_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Use opus_read to download
    command = [
        'opus_read',
        '-d', corpus_name,
        '-s', source_lang,
        '-t', target_lang,
        '-w', str(output_dir / f"{source_lang}-{target_lang}.txt"),
        '-wm', 'moses',  # Moses format (tab-separated)
    ]
    
    try:
        # Increase timeout to 30 minutes for large corpora
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=1800  # 30 minute timeout
        )
        
        if result.returncode == 0:
            print(f"✅ Success! Downloaded to {output_dir}")
            return True
        else:
            print(f"⚠️  No data available or download failed")
            if result.stderr:
                print(f"Error: {result.stderr[:200]}")  # Show first 200 chars
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏱️  Timeout after 30 minutes - trying alternative method")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🌍 GRIOT Translation Data Downloader")
    print("=" * 60)
    print(f"Downloading data for {len(LANGUAGE_PAIRS)} language pairs")
    print(f"Using {len(CORPORA)} different corpora")
    print("=" * 60)
    
    stats = {
        'total': 0,
        'successful': 0,
        'failed': 0
    }
    
    for source, target, name in LANGUAGE_PAIRS:
        print(f"\n\n{'#'*60}")
        print(f"# Processing: {name.upper()} ({source} → {target})")
        print(f"{'#'*60}")
        
        for corpus in CORPORA:
            stats['total'] += 1
            success = download_corpus(source, target, corpus, name)
            
            if success:
                stats['successful'] += 1
            else:
                stats['failed'] += 1
    
    # Print summary
    print("\n\n" + "="*60)
    print("📊 DOWNLOAD SUMMARY")
    print("="*60)
    print(f"Total downloads attempted: {stats['total']}")
    print(f"✅ Successful: {stats['successful']}")
    print(f"❌ Failed: {stats['failed']}")
    print(f"Success rate: {stats['successful']/stats['total']*100:.1f}%")
    print("="*60)
    
    print(f"\n📁 Data saved to: {RAW_DIR.absolute()}")
    print("\n✨ Next step: Run the data processing script to clean and combine the data")

if __name__ == "__main__":
    main()