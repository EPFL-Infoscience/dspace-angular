import { TextDiffPipe } from './text-diff.pipe';

describe('TextDiffPipe', () => {
  const pipe = new TextDiffPipe();
  const value1 = `test Content`;
  const value2 = `Item's content`;

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return text differences', () => {
    const diff = pipe.transform(value1, value2);
    expect(diff).toContain('</del><ins>');
  });

  it('should return no text differences', () => {
    const diff = pipe.transform('test', 'test');
    expect(diff).toEqual('test');
  });
});
