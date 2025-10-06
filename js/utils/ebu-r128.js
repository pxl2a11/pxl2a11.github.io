var EBU_R128 = (function () {
  'use strict';

  // pre-computed coefficients for the K-weighting filter
  const K_FILTER_STAGE1_COEFFICIENTS = new Float32Array([-0.691, 10.224, -63.37, 175.8, -247.9, 187.1]);
  const K_FILTER_STAGE2_COEFFICIENTS = new Float32Array([1.535, 2.063, -9.474, 12.72, -7.53, 1.698]);
  const K_FILTER_STAGE1_B = new Float32Array([1.0000000000000004, 2, 1, 1.0000000000000004, 2.000000000000001, 1.0000000000000004]);
  const K_FILTER_STAGE1_A = new Float32Array([-0.9999999999999996, -1.9999999999999991, 1, -0.9999999999999996, -2, -1]);

  // high-pass filter for the pre-filter
  const HIGHPASS_FILTER_B = new Float32Array([1.0, -2.0, 1.0]);
  const HIGHPASS_FILTER_A = new Float32Array([1.0, -1.99001624, 0.99005623]);

  const SUPERSAMPLING_FACTOR = 1;
  const SUPERSAMPLING_MAX_RATE = 192000;

  function Filter(A, B, x_hist_len, y_hist_len) {
      this.A = new Float32Array(A);
      this.B = new Float32Array(B);
      this.x = new Float32Array(x_hist_len);
      this.y = new Float32Array(y_hist_len);
  }

  // ================== ИСПРАВЛЕННАЯ ФУНКЦИЯ ==================
  Filter.prototype.process = function (input) {
      let i, j, s;
      const A = this.A;
      const B = this.B;
      const x = this.x;
      const y = this.y;

      for (i = 0; i < input.length; i++) {
          s = A[0] * input[i];
          for (j = 0; j < x.length; j++) {
              s += A[j + 1] * x[j] - B[j + 1] * y[j];
          }
          for (j = x.length - 1; j > 0; j--) {
              x[j] = x[j - 1];
              y[j] = y[j - 1];
          }
          x[0] = input[i];
          y[0] = s;
          // Результат присваивается правильно, без лишнего цикла
          input[i] = s;
      }
  };
  // ==========================================================

  const K_FILTER_MAX_RATE = 192000;

  class KFilter {
      constructor(samplerate, channels) {
          this.samplerate = samplerate;
          this.channels = channels;
          this.filters = new Array(channels);
          for (let i = 0; i < channels; i++) {
              let A, B, x_len, y_len;
              if (samplerate > K_FILTER_MAX_RATE) {
                  // stage 2 of the k-weighting filter
                  A = K_FILTER_STAGE2_COEFFICIENTS;
                  B = K_FILTER_STAGE1_A;
                  x_len = 5;
                  y_len = 5;
              } else {
                  // stage 1 of the k-weighting filter
                  A = K_FILTER_STAGE1_COEFFICIENTS;
                  B = K_FILTER_STAGE1_B;
                  x_len = 3;
                  y_len = 3;

                  const f0_1 = 107.65215; // frequency of the high-pass filter
                  const f0_2 = 399.99822; // frequency of the high-shelf filter
                  const G = 4.99; // gain of the high-shelf filter
                  const Q1 = 1 / Math.sqrt(2);
                  const Q2 = 1 / Math.sqrt(2);

                  const K1 = Math.tan(Math.PI * f0_1 / samplerate);
                  const K2 = Math.tan(Math.PI * f0_2 / samplerate);
                  const V0 = Math.pow(10, G / 20);

                  const D = (K1 * K1 * V0) + K1 / Q1 + V0;
                  const E = (K2 * K2 * V0) + K2 / Q2 + V0;

                  const a0 = 1 + K1 / Q1 + K1 * K1;
                  const a1 = 2 * (K1 * K1 - 1);
                  const a2 = 1 - K1 / Q1 + K1 * K1;
                  const b0 = 1 + K2 / Q2 + K2 * K2;
                  const b1 = 2 * (K2 * K2 - 1);
                  const b2 = 1 - K2 / Q2 + K2 * K2;

                  const A_hp = 1 / (1 + K1 / Q1 + K1 * K1);
                  const A_hs = 1 / (1 + K2 / Q2 + K2 * K2);
                  const B_hs = V0 / (1 + K2 / Q2 + K2 * K2);

                  const A1 = 1, A2 = -2, A3 = 1;
                  const B1 = 1, B2 = -2 * (1 - K1 * K1) / (1 + K1 / Q1 + K1 * K1), B3 = (1 - K1 / Q1 + K1 * K1) / (1 + K1 / Q1 + K1 * K1);

                  const C1 = 1, C2 = 2 * (K2 * K2 - 1) / (1 + K2 / Q2 + K2 * K2), C3 = (1 - K2 / Q2 + K2 * K2) / (1 + K2 / Q2 + K2 * K2);

                  const D1 = V0, D2 = 2 * V0 * (K2 * K2 - 1) / (1 + K2 / Q2 + K2 * K2), D3 = V0 * (1 - K2 / Q2 + K2 * K2) / (1 + K2 / Q2 + K2 * K2);

                  const t_K1 = Math.tan(Math.PI * 107.65215 / samplerate);
                  const t_K2 = Math.tan(Math.PI * 399.99822 / samplerate);

                  const highpass_b = 1.0;
                  const highpass_a = 1.0;
                  const highshelf_b = 1.0;
                  const highshelf_a = 1.0;
                  const p_A1 = 1.0 + t_K1, p_A2 = 1.0 - t_K1;
                  const p_A3 = 1.0 + t_K2, p_A4 = 1.0 - t_K2;
                  const p_A5 = 1.0 / (p_A1 * p_A3);

                  const p_m0 = p_A5 * p_A2 * p_A4;
                  const p_m1 = p_A5 * p_A1 * p_A4;
                  const p_m2 = p_A5 * p_A2 * p_A3;
                  A = new Float32Array([1, -p_m1 - p_m2, p_m0]);
                  B = new Float32Array([1, p_m1 - p_m2, p_m0]);
              }
              this.filters[i] = new Filter(A, B, x_len, y_len);
          }
      }
  }
  KFilter.prototype.process = function (input, input_stereo) {
      if (input_stereo === undefined) {
          this.filters[0].process(input);
      } else {
          for (let i = 0; i < this.channels; i++) {
              this.filters[i].process(arguments[i]);
          }
      }
  };

  const GATING_BLOCK_DURATION = 0.4; // 400ms

  class GatingBlock {
      constructor(samplerate) {
          this.samplerate = samplerate;
          this.gate_block_size = Math.round(GATING_BLOCK_DURATION * samplerate);
      }
  }

  GatingBlock.prototype.process = function (input, input_stereo) {
      const mono_input = input;
      const stereo_input = input_stereo;

      const number_of_blocks = Math.ceil(mono_input[0].length / this.gate_block_size);
      const gated_loudness = new Float32Array(number_of_blocks);
      const gated_loudness_stereo = new Float32Array(stereo_input ? Math.ceil(stereo_input.length / this.gate_block_size) : 0);

      let sum = 0, sample_count = 0;
      let block_index = 0;
      let sample_index = 0;
      for (let i = 0; i < gated_loudness.length; i++) {
          gated_loudness[i] = 0;
          let current_block_start = sample_index;
          for (; sample_index < current_block_start + this.gate_block_size && sample_index < mono_input[0].length; sample_index++) {
              for (let j = 0; j < mono_input.length; j++) {
                  gated_loudness[i] += mono_input[j][sample_index] * mono_input[j][sample_index];
              }
          }
          gated_loudness[i] /= (this.gate_block_size * mono_input.length);
      }

      if (stereo_input) {
          sample_index = 0;
          for (let i = 0; i < gated_loudness_stereo.length; i++) {
              gated_loudness_stereo[i] = 0;
              let current_block_start = sample_index;
              for (; sample_index < current_block_start + this.gate_block_size && sample_index < stereo_input[0].length; sample_index++) {
                  for (let j = 0; j < stereo_input.length; j++) {
                      gated_loudness_stereo[i] += stereo_input[j][sample_index] * stereo_input[j][sample_index];
                  }
              }
              gated_loudness_stereo[i] /= (this.gate_block_size * stereo_input.length);
          }
      }

      const audio_buffer_mono = new Array(mono_input.length);
      for (let i = 0; i < audio_buffer_mono.length; i++) {
          audio_buffer_mono[i] = new Float32Array(0);
      }
      let audio_buffer_stereo = new Float32Array(0);

      let total_samples = 0;
      for (let i = 0; i < gated_loudness.length; i++) {
          if (gated_loudness[i] > -70) { // relative threshold of -70 LUFS
              for (let j = 0; j < mono_input.length; j++) {
                  total_samples += this.gate_block_size;
              }
          }
      }
      if (total_samples > 0) {
          for (let i = 0; i < mono_input.length; i++) {
              audio_buffer_mono[i] = new Float32Array(total_samples);
          }
          if (stereo_input)
              audio_buffer_stereo = new Float32Array(total_samples);
          let sample_cursor = 0;
          for (let i = 0; i < gated_loudness.length; i++) {
              if (gated_loudness[i] > -70) {
                  const start_sample = i * this.gate_block_size;
                  for (let j = 0; j < this.gate_block_size && start_sample + j < mono_input[0].length; j++) {
                      for (let k = 0; k < mono_input.length; k++) {
                          audio_buffer_mono[k][sample_cursor + j] = mono_input[k][start_sample + j];
                      }
                      if (stereo_input)
                          audio_buffer_stereo[sample_cursor + j] = stereo_input[start_sample + j];
                  }
                  sample_cursor += this.gate_block_size;
              }
          }
      }
      return { audio: audio_buffer_mono, gated_loudness: gated_loudness, gated_loudness_stereo: gated_loudness_stereo };
  };

  const Z_FILTER_CONSTANT = -0.691;

  function meanSquare(gated_loudness) {
      let sum = 0;
      for (let i = 0; i < gated_loudness.length; i++) {
          sum += gated_loudness[i];
      }
      return 10 * Math.log10(sum / gated_loudness.length) + Z_FILTER_CONSTANT;
  }

  function truePeak(audio, l_channel, r_channel) {
      let max_sample = 0;
      let sample_pos = 0;
      const channel_count = audio.length;
      const sample_count = audio[0].length;

      const audio_copy = new Array(audio.length);
      for (let i = 0; i < audio.length; i++) {
          audio_copy[i] = new Float32Array(audio[i].length);
          for (let j = 0; j < audio[i].length; j++) {
              audio_copy[i][j] = audio[i][j];
          }
      }

      if (l_channel) {
          for (let i = 0; i < audio_copy[0].length; i++) {
              audio_copy[0][i] += l_channel[i];
          }
      }
      if (r_channel) {
          for (let i = 0; i < audio_copy[1].length; i++) {
              audio_copy[1][i] += r_channel[i];
          }
      }

      const sum_channels = new Float32Array(audio_copy[0].length);
      for (let i = 0; i < channel_count; i++) {
          for (let j = 0; j < sample_count; j++) {
              sum_channels[j] += audio_copy[i][j];
          }
      }
      for (let i = 0; i < sum_channels.length; i++) {
          if (sum_channels[i] >= max_sample) {
              max_sample = sum_channels[i];
              sample_pos = i;
          }
      }
      return { max_sample: Math.sqrt(max_sample), sample_pos: sample_pos };
  }

  class EBU_R128 {
      constructor(samplerate, channels) {
          this.samplerate = samplerate;
          this.c = channels || 1;
          this.k = new KFilter(samplerate, channels);
          this.g = new GatingBlock(samplerate);
      }
      process(mono_input, stereo_input) {
          const channels = this.c;
          let audio_buffer_k, gated_results;
          if (channels === 1) {
              audio_buffer_k = [new Float32Array(mono_input)];
          } else {
              const left_channel = new Float32Array(mono_input);
              const right_channel = new Float32Array(stereo_input);
              audio_buffer_k = [left_channel, right_channel];
          }

          this.k.process(audio_buffer_k);

          gated_results = this.g.process(audio_buffer_k);
          this.gated_loudness = meanSquare(gated_results.gated_loudness);
          this.relative_threshold = -10 + this.gated_loudness;

          // --- ИСПРАВЛЕНИЕ ---
          // Обработка случая, когда аудиофайл содержит тишину.
          // Если после фильтрации по порогу не осталось блоков, громкость
          // по стандарту EBU R128 считается равной -Infinity.
          if (gated_results.gated_loudness.length > 0) {
              const above_gate = gated_results.gated_loudness.filter((val) => val > this.relative_threshold);
              
              if (above_gate.length > 0) {
                  this.lufs = meanSquare(above_gate);
              } else {
                  this.lufs = -Infinity;
              }
          } else {
               this.lufs = -Infinity;
          }
          // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

          this.true_peak = truePeak(gated_results.audio).max_sample;
      }
      getIntegratedLoudness() {
          return this.lufs;
      }
  }

  EBU_R128.prototype.getTruePeak = function () {
      return 20 * Math.log10(this.true_peak);
  };
  EBU_R128.prototype.getSamplePeak = function () {
      return this.true_peak;
  };
  EBU_R128.prototype.getLUFS = function () {
      return this.lufs;
  };
  EBU_R128.prototype.getLoudness = function () {
      return this.lufs;
  };
  EBU_R128.prototype.getIntegratedLoudness = function () {
      return this.lufs;
  };
  return EBU_R128;
}());
