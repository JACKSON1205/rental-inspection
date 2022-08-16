import base64 

from flask import current_app
from PIL import Image


def resize_by_size(in_path: str, out_path: str, max_size: tuple = (1920, 1920)) -> None:
    """
    resize image by max_size

    Inputs:
    - in_path: str, path of input image
    - out_path: str, path of output image
    - max_size: tuple(int,int), max size of output image
    """
    try:
        im = Image.open(in_path)
        im.thumbnail(max_size)
        im.save(out_path)
        return None
    except Exception:
        return "Fails to resize image"


def encode_image(image_path):
    """
    encode image as base64

    Inputs:
    - image_path: str, path of image

    Return:
        base64_string: str, encoded as base64
    """

    try:
        with open(image_path, "rb") as image_file:
            base64_bytes = base64.b64encode(image_file.read())
            img_type = 'data:image/'+image_path.split('.')[-1]+';base64,'
            base64_string = img_type+base64_bytes.decode('ascii')
        return base64_string
    except Exception:
        return None
