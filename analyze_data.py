import csv
from pathlib import Path
from collections import Counter
import statistics

DATA_DIR = Path("training_data")
PROCESSED_DIR = DATA_DIR / "processed"

def analyze_dataset(filepath):
    """Analyze a single dataset file"""
    
    if not filepath.exists():
        return None
    
    source_lengths = []
    target_lengths = []
    vocab_source = set()
    vocab_target = set()
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            source = row['source_text']
            target = row['target_text']
            
            source_lengths.append(len(source.split()))
            target_lengths.append(len(target.split()))
            
            vocab_source.update(source.lower().split())
            vocab_target.update(target.lower().split())
    
    return {
        'count': len(source_lengths),
        'source_avg_len': statistics.mean(source_lengths) if source_lengths else 0,
        'target_avg_len': statistics.mean(target_lengths) if target_lengths else 0,
        'source_vocab': len(vocab_source),
        'target_vocab': len(vocab_target),
    }

def main():
    print("📊 GRIOT Data Analysis")
    print("="*80)
    
    languages = [
        ('sw', 'Swahili'),
        ('yo', 'Yoruba'),
        ('ha', 'Hausa'),
        ('ig', 'Igbo'),
        ('zu', 'Zulu'),
        ('xh', 'Xhosa'),
        ('af', 'Afrikaans'),
        ('am', 'Amharic'),
        ('so', 'Somali'),
        ('rw', 'Kinyarwanda'),
        ('fr', 'French'),
        ('ar', 'Arabic'),
        ('pt', 'Portuguese'),
    ]
    
    print(f"{'Language':<20} {'Pairs':>10} {'Src Len':>10} {'Tgt Len':>10} {'Src Vocab':>12} {'Tgt Vocab':>12}")
    print("-"*80)
    
    for code, name in languages:
        filepath = PROCESSED_DIR / f"en-{code}-train.csv"
        
        stats = analyze_dataset(filepath)
        
        if stats:
            print(f"{name:<20} {stats['count']:>10,} "
                  f"{stats['source_avg_len']:>10.1f} "
                  f"{stats['target_avg_len']:>10.1f} "
                  f"{stats['source_vocab']:>12,} "
                  f"{stats['target_vocab']:>12,}")
        else:
            print(f"{name:<20} {'No data':>10}")
    
    print("="*80)
    
    print("\n Tips:")
    print("  • Good: 50k+ pairs per language")
    print("  • Minimum: 10k pairs for basic quality")
    print("  • Vocabulary: More = better coverage")
    print("  • Average length: 8-15 words is ideal for conversation")

if __name__ == "__main__":
    main()