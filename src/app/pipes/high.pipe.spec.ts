import { HighPipe } from './high.pipe';

describe('HighPipe', () => {
  it('create an instance', () => {
    const pipe = new HighPipe();
    expect(pipe).toBeTruthy();
  });
});
