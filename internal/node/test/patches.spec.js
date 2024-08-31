const fs = require('fs');
const path = require('path');
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);

describe('node fs function does not throw:', () => {
    const files = runfiles.resolvePackageRelative('dir_output')
    const filesBuf = Buffer.from(files);
    const filesUrl = new URL('file://' + files);
    const doNothingCallback = () => {}
    
    // listed in order of appearance in the patch file
    it('lstat', () => {
        expect(() => fs.lstat(files, doNothingCallback)).not.toThrow();
        expect(() => fs.lstat(filesBuf, doNothingCallback)).not.toThrow();
        expect(() => fs.lstat(filesUrl, doNothingCallback)).not.toThrow();
    });
    
    it('realpath', () => {
        expect(() => fs.realpath(files, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.realpath(filesBuf, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.realpath(filesUrl, undefined, doNothingCallback)).not.toThrow();
    });
    
    it('realpath.native', () => {
        expect(() => fs.realpath.native(files, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.realpath.native(filesBuf, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.realpath.native(filesUrl, undefined, doNothingCallback)).not.toThrow();
    });
    
    it('readlink', () => {
        expect(() => fs.readlink(files, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.readlink(filesBuf, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.readlink(filesUrl, undefined, doNothingCallback)).not.toThrow();
    });
    
    it('lstatSync', () => {
        expect(() => fs.lstatSync(files)).not.toThrow();
        expect(() => fs.lstatSync(filesBuf)).not.toThrow();
        expect(() => fs.lstatSync(filesUrl)).not.toThrow();
    });

    it('realpathSync', () => {
        expect(() => fs.realpathSync(files)).not.toThrow();
        expect(() => fs.realpathSync(filesBuf)).not.toThrow();
        expect(() => fs.realpathSync(filesUrl)).not.toThrow();
    });
    
    it('realpathSync.native', () => {
        expect(() => fs.realpathSync.native(files)).not.toThrow();
        expect(() => fs.realpathSync.native(filesBuf)).not.toThrow();
        expect(() => fs.realpathSync.native(filesUrl)).not.toThrow();
    });
    
    it('readlinkSync', () => {
        const symlinkPath = path.join(files, 'symlink');
        fs.symlinkSync(files, symlinkPath);
        const symlinkPathBuf = Buffer.from(symlinkPath);
        const symlinkPathUrl = new URL(`file://${symlinkPath}`);
        expect(() => fs.readlinkSync(symlinkPath)).not.toThrow();
        expect(() => fs.readlinkSync(symlinkPathBuf)).not.toThrow();
        expect(() => fs.readlinkSync(symlinkPathUrl)).not.toThrow();
    });

    it('readdir', () => {
        expect(() => fs.readdir(files, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.readdir(filesBuf, undefined, doNothingCallback)).not.toThrow();
        expect(() => fs.readdir(filesUrl, undefined, doNothingCallback)).not.toThrow();
    });
    
    it('readdirSync', () => {
        expect(() => fs.readdirSync(files)).not.toThrow();
        expect(() => fs.readdirSync(filesBuf)).not.toThrow();
        expect(() => fs.readdirSync(filesUrl)).not.toThrow();
    });

});
