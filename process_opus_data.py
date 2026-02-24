import os
import csv
import re
from pathlib import Path
from collections import defaultdict
import random

# Directories
DATA_DIR = Path("training_data")
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
VALIDATION_DIR = DATA_DIR / "validation"

VALIDATION_DIR.mkdir(parents=True, exist_ok=True)

# Language pairs
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

def clean_sentence(text):
    """Clean a single sentence"""
    if not text:
        return None
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove if too short or too long
    if len(text) < 3 or len(text) > 500:
        return None
    
    # Remove if it's mostly numbers or punctuation
    alpha_ratio = sum(c.isalpha() for c in text) / len(text)
    if alpha_ratio < 0.5:
        return None
    
    return text

def is_valid_pair(source_text, target_text):
    """Check if a sentence pair is valid"""
    
    if not source_text or not target_text:
        return False
    
    # Length ratio check (target shouldn't be 10x longer/shorter)
    len_ratio = len(target_text) / len(source_text)
    if len_ratio > 10 or len_ratio < 0.1:
        return False
    
    # Check if they're not the same (common error)
    if source_text == target_text:
        return False
    
    return True

def process_moses_file(filepath):
    """Process a Moses format file (tab-separated)"""
    pairs = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split('\t')
                
                if len(parts) != 2:
                    continue
                
                source_text = clean_sentence(parts[0])
                target_text = clean_sentence(parts[1])
                
                if is_valid_pair(source_text, target_text):
                    pairs.append((source_text, target_text))
    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return pairs

def process_language_pair(source_lang, target_lang, lang_name):
    """Process all data for a single language pair"""
    
    print(f"\n{'='*60}")
    print(f"Processing {lang_name} ({source_lang}-{target_lang})")
    print(f"{'='*60}")
    
    all_pairs = []
    seen_pairs = set()  # For deduplication
    
    # Find all downloaded files for this language pair
    lang_dir = RAW_DIR / f"{source_lang}-{target_lang}"
    
    if not lang_dir.exists():
        print(f"No data found for {lang_name}")
        return 0
    
    # Process each corpus
    for corpus_dir in lang_dir.iterdir():
        if not corpus_dir.is_dir():
            continue
        
        corpus_name = corpus_dir.name
        print(f"Processing {corpus_name}...")
        
        # Look for Moses format files
        for file in corpus_dir.glob("*.txt"):
            pairs = process_moses_file(file)
            
            # Deduplicate
            new_pairs = 0
            for source, target in pairs:
                pair_key = f"{source}|||{target}"
                if pair_key not in seen_pairs:
                    seen_pairs.add(pair_key)
                    all_pairs.append((source, target))
                    new_pairs += 1
            
            print(f"Added {new_pairs} unique pairs from {file.name}")
    
    if not all_pairs:
        print(f"No valid data found for {lang_name}")
        return 0
    
    # Shuffle the data
    random.shuffle(all_pairs)
    
    # Split into train/validation/test (80/10/10)
    n = len(all_pairs)
    train_split = int(0.8 * n)
    val_split = int(0.9 * n)
    
    train_pairs = all_pairs[:train_split]
    val_pairs = all_pairs[train_split:val_split]
    test_pairs = all_pairs[val_split:]
    
    # Save training data
    train_file = PROCESSED_DIR / f"{source_lang}-{target_lang}-train.csv"
    save_to_csv(train_pairs, train_file, source_lang, target_lang)
    print(f"Saved {len(train_pairs)} training pairs to {train_file.name}")
    
    # Save validation data
    val_file = VALIDATION_DIR / f"{source_lang}-{target_lang}-val.csv"
    save_to_csv(val_pairs, val_file, source_lang, target_lang)
    print(f"Saved {len(val_pairs)} validation pairs to {val_file.name}")
    
    # Save test data
    test_file = VALIDATION_DIR / f"{source_lang}-{target_lang}-test.csv"
    save_to_csv(test_pairs, test_file, source_lang, target_lang)
    print(f"Saved {len(test_pairs)} test pairs to {test_file.name}")
    
    print(f"Total: {len(all_pairs)} sentence pairs")
    
    return len(all_pairs)

def save_to_csv(pairs, filepath, source_lang, target_lang):
    """Save sentence pairs to CSV"""
    
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['source_lang', 'target_lang', 'source_text', 'target_text'])
        
        for source, target in pairs:
            writer.writerow([source_lang, target_lang, source, target])

def main():
    print("GRIOT Data Processing Pipeline")
    print("="*60)
    
    stats = defaultdict(int)
    
    for source, target, name in LANGUAGE_PAIRS:
        count = process_language_pair(source, target, name)
        stats[name] = count
    
    # Print summary
    print("\n\n" + "="*60)
    print("PROCESSING SUMMARY")
    print("="*60)
    
    total = 0
    for name, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
        print(f"{name:20s}: {count:>8,} pairs")
        total += count
    
    print("-"*60)
    print(f"{'TOTAL':20s}: {total:>8,} pairs")
    print("="*60)
    
    print(f"\nTraining data saved to: {PROCESSED_DIR.absolute()}")
    print(f"Validation data saved to: {VALIDATION_DIR.absolute()}")
    
    print("\nNext step: Train your model using the processed data!")

if __name__ == "__main__":
    # Set random seed for reproducibility
    random.seed(42)
    main()