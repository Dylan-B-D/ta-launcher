import struct
import os

class Position:
    def __init__(self):
        self.time = 0.0
        self.loc = (0.0, 0.0, 0.0)
        self.vel = (0.0, 0.0, 0.0)
        self.pitch = 0
        self.yaw = 0
        self.phys = 0
        self.skiing = False
        self.jetting = False
        self.health = 0
        self.energy = 0.0
        self.eta = 0

    def __str__(self):
        return str(self.__dict__)
    
def switch_team_in_filename(filename):
    if '_DS_' in filename:
        return filename.replace('_DS_', '_BE_', 1)
    elif '_BE_' in filename:
        return filename.replace('_BE_', '_DS_', 1)
    else:
        return filename  # If neither is found, return the original filename

def process_and_save_route(filepath, filename, axis='xy'):
    full_path = os.path.join(filepath, filename)

    # Decode the route file
    data, positions = decode_route_file(full_path)

    # Mirror the route
    mirrored_data, mirrored_positions = mirror_route(data, positions, axis)

    # Switch the team in the filename
    new_filename = switch_team_in_filename(filename)

    # Reencrypt the mirrored route file
    mirrored_full_path = os.path.join(filepath, new_filename)
    reencrypt_route_file(mirrored_full_path, mirrored_data, mirrored_positions)

    return mirrored_full_path

def read_cstring(file):
    """Read a C-style string from the binary file."""
    chars = []
    while True:
        c = file.read(1)
        if c == b' ' or c == b'\0':
            break
        chars.append(c)
    return b''.join(chars).decode('utf-8')

def decode_route_file(filename):
    data = {}
    positions = []

    with open(filename, 'rb') as file:
        # Read version
        routeFileVersion, = struct.unpack('f', file.read(4))
        data['routeFileVersion'] = routeFileVersion

        # Read strings
        data['mapName'] = read_cstring(file)
        data['classAbbr'] = read_cstring(file)
        data['playerName'] = read_cstring(file)
        data['description'] = read_cstring(file)

        # Read metadata
        teamNum, = struct.unpack('B', file.read(1))
        classID, = struct.unpack('i', file.read(4))
        classHealth, = struct.unpack('I', file.read(4))
        flagGrabTime, = struct.unpack('f', file.read(4))
        routeLength, = struct.unpack('I', file.read(4))

        data['teamNum'] = teamNum
        data['classID'] = classID
        data['classHealth'] = classHealth
        data['flagGrabTime'] = flagGrabTime
        data['routeLength'] = routeLength

        # Decode positions
        while True:
            pos_data = file.read(52)  # Corrected size of position struct
            if len(pos_data) < 52:
                break  # Not enough data for a full position struct

            pos = Position()
            # Unpack position
            pos_values = struct.unpack('f3f3f2i3BIfi', pos_data)
            pos.time = pos_values[0]
            pos.loc = pos_values[1:4]
            pos.vel = pos_values[4:7]
            pos.pitch = pos_values[7]
            pos.yaw = pos_values[8]
            pos.phys = pos_values[9]
            pos.skiing = bool(pos_values[10])
            pos.jetting = bool(pos_values[11])
            pos.health = pos_values[12]
            pos.energy = pos_values[13]
            pos.eta = pos_values[14]

            positions.append(pos)

    return data, positions


def mirror_route(data, positions, axis='xy'):
    """
    Mirror the route on specified axes.
    axis: 'x', 'y', 'xy', or 'yx'
    """
    for pos in positions:
        x, y, z = pos.loc

        if 'x' in axis:
            x = -x
        if 'y' in axis:
            y = -y

        pos.loc = (x, y, z)

    # Swap team number
    data['teamNum'] = 1 if data['teamNum'] == 0 else 0

    return data, positions

def reencrypt_route_file(filepath, data, positions):
    
    with open(filepath, 'wb') as file:
        # Write version
        file.write(struct.pack('f', data['routeFileVersion']))
        
        # Write strings
        file.write(data['mapName'].encode('utf-8'))
        file.write(b' ')
        file.write(data['classAbbr'].encode('utf-8'))
        file.write(b' ')
        file.write(data['playerName'].encode('utf-8'))
        file.write(b' ')
        file.write(data['description'].encode('utf-8'))
        file.write(b' ')
        
        # Write metadata
        file.write(struct.pack('B', data['teamNum']))
        file.write(struct.pack('i', data['classID']))
        file.write(struct.pack('I', data['classHealth']))
        file.write(struct.pack('f', data['flagGrabTime']))
        file.write(struct.pack('I', data['routeLength']))

        # Write positions
        for pos in positions:
            pos_data = struct.pack('f3f3f2i3BIfi', 
                                   pos.time, 
                                   pos.loc[0], pos.loc[1], pos.loc[2], 
                                   pos.vel[0], pos.vel[1], pos.vel[2], 
                                   pos.pitch, pos.yaw, 
                                   pos.phys, 
                                   int(pos.skiing), int(pos.jetting), 
                                   pos.health, 
                                   pos.energy, pos.eta)
            file.write(pos_data)
    
    return filepath

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: python route_decoder_script.py <filepath> <filename> <axis>")
        sys.exit(1)

    filepath = sys.argv[1]
    filename = sys.argv[2]
    axis = sys.argv[3]  # Axis for mirroring
    result_filepath = process_and_save_route(filepath, filename, axis)
    print(f"Processed route saved as {result_filepath}")