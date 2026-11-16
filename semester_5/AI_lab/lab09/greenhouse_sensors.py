import numpy as np

np.random.seed(7)
readings = np.random.randint(20, 41, size=(6, 3))
print(readings)

sensor_means = readings.mean(axis=0)
print("Mean per sensor:", sensor_means)

sensor_stds = readings.std(axis=0)
normalized = (readings - sensor_means) / sensor_stds
print("Normalized column means:", np.round(normalized.mean(axis=0), 10) + 0.0)

peak_hours = readings.argmax(axis=0)
print("Hour of max per sensor:", peak_hours)

combined = np.vstack([readings, sensor_means])
print(combined.shape)

np.random.seed(7)
readings_again = np.random.randint(20, 41, size=(6, 3))
print("Reproducible:", np.array_equal(readings, readings_again))