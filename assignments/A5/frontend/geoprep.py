"""Reduces the file size of a GeoJSON file by removing unnecessary properties."""
import pathlib
import json

json_path = pathlib.Path(__file__).parent / "assets" / "world.geo.json"
needed_prop_keys = {'adm0_a3', 'name', 'continent'}

if __name__ == '__main__':
    initial_file_size = json_path.stat().st_size
    dct = json.loads(json_path.read_text())
    reduced_props = {}
    for i, feature in enumerate(dct['features']):
        props = feature['properties']
        for key in props.keys():
            if key in needed_prop_keys:
                reduced_props[key] = props[key]
        dct['features'][i]['properties'] = reduced_props
        reduced_props = {}
    raw_json = json.dumps(dct)
    json_path.write_text(raw_json)
    print(f"{json_path} has been reduced to include only the following properties: {needed_prop_keys}")
    final_file_size = json_path.stat().st_size
    print(f"{initial_file_size - final_file_size} bytes have been saved.")
    print(f"{(initial_file_size - final_file_size) / initial_file_size * 100}% of the file has been saved.")
