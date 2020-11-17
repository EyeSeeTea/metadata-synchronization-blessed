import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { TextDecoder, TextEncoder } from "util";

configure({ adapter: new Adapter() });

// Polyfill for encoding which isn't present globally in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
