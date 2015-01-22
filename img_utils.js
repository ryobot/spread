// img_utils.js

function color_adjust ( image, by_red, by_grn, by_blu ) {
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            // red
            val = image.data[(y * image.width + x) * 4 + 0] * by_red;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 0] = val;
            // green
            val = image.data[(y * image.width + x) * 4 + 1] * by_grn;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 1] = val;
            // blue
            val = image.data[(y * image.width + x) * 4 + 2] * by_blu;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 2] = val;	 
        }
    }
}

function color_adjust_diff ( image, df_red, df_grn, df_blu ) {
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            // red
            val = image.data[(y * image.width + x) * 4 + 0] + df_red;
            if ( val > 255 ) val = 255;
            if ( val < 0 ) val = 0;
            image.data[(y * image.width + x) * 4 + 0] = val;
            // green
            val = image.data[(y * image.width + x) * 4 + 1] + df_grn;
            if ( val > 255 ) val = 255;
            if ( val < 0 ) val = 0;
            image.data[(y * image.width + x) * 4 + 1] = val;
            // blue
            val = image.data[(y * image.width + x) * 4 + 2] + df_blu;
            if ( val > 255 ) val = 255;
            if ( val < 0 ) val = 0;
            image.data[(y * image.width + x) * 4 + 2] = val;	 
        }
    }
}

function normalize ( image, ratio ) {
    var m_red = 0;
    var m_grn = 0;
    var m_blu = 0;
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            m_red += image.data[(y * image.width + x) * 4 + 0];
            m_grn += image.data[(y * image.width + x) * 4 + 1];
            m_blu += image.data[(y * image.width + x) * 4 + 2];
        }
    }
    m_red /= image.width*image.height;
    m_grn /= image.width*image.height;
    m_blu /= image.width*image.height;
    var m_all = (m_red + m_grn + m_blu)/3.0;
    var offset = (128 - m_all) * ratio;

    color_adjust_diff( image, offset, offset, offset );
}

function greyer ( image, ratio ) {
    var m_red = 0;
    var m_grn = 0;
    var m_blu = 0;
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            m_red += image.data[(y * image.width + x) * 4 + 0];
            m_grn += image.data[(y * image.width + x) * 4 + 1];
            m_blu += image.data[(y * image.width + x) * 4 + 2];
        }
    }
    m_red /= image.width*image.height;
    m_grn /= image.width*image.height;
    m_blu /= image.width*image.height;

    color_adjust( image,
                 128/((m_red - 128)*ratio + 128),
                 128/((m_grn - 128)*ratio + 128),
                 128/((m_blu - 128)*ratio + 128) );
}

function greyer2 ( image, ratio ) {
    if ( ratio < 0.0 || ratio > 1.0 ) return;
    ratio = 1.0 - ratio;
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var red = image.data[(y * image.width + x) * 4 + 0];
            var grn = image.data[(y * image.width + x) * 4 + 1];
            var blu = image.data[(y * image.width + x) * 4 + 2];
            red = 128 - (128 - red)*ratio;
            grn = 128 - (128 - grn)*ratio;
            blu = 128 - (128 - blu)*ratio;
            image.data[(y * image.width + x) * 4 + 0] = red;
            image.data[(y * image.width + x) * 4 + 1] = grn;
            image.data[(y * image.width + x) * 4 + 2] = blu;
        }
    }
}


