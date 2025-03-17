import os

def find_duplicates(folder1, folder2):
    # Lấy danh sách tên tệp và thư mục trong hai thư mục
    set1 = set(os.listdir(folder1))
    set2 = set(os.listdir(folder2))
    
    only_in_folder1 = set1 - set2
    only_in_folder2 = set2 - set1
    
    # In kết quả
    print(f"Các phần tử chỉ có trong {folder1}:")
    for item in only_in_folder1:
        print(item)

    print(f"\nCác phần tử chỉ có trong {folder2}:")
    for item in only_in_folder2:
        print(item)

# Thay đổi đường dẫn thư mục tùy theo hệ thống của bạn
folder1 = "D:\Audio_WAV"
folder2 = "D:\Audio_original\Audio_WAV"

find_duplicates(folder1, folder2)
