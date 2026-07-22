import sys
from paddleocr import PaddleOCR


def main():
    if len(sys.argv) < 2:
        print("Uso: python run_paddleocr.py <caminho_da_imagem>", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    ocr = PaddleOCR(
        use_angle_cls=True,
        lang="en",
        show_log=False,
        use_gpu=False,
    )

    result = ocr.ocr(image_path, cls=True)

    if not result or not result[0]:
        print("")
        sys.exit(0)

    for line in result[0]:
        text = line[1][0]
        print(text)


if __name__ == "__main__":
    main()
